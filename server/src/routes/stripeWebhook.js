import { and, eq, ne } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders } from '../db/schema.js'
import { parseId } from '../lib/parseId.js'
import { stripe } from '../lib/stripe.js'

// POST /api/stripe/webhook
// Stripe calls this itself. It is the ONLY place an order is marked "paid", and
// only after the signature proves the request really came from Stripe.
// Needs the raw body, so it is mounted before express.json() in index.js.
export async function stripeWebhook(req, res) {
  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.error('Webhook signature check failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const session = event.data.object
  const orderId = parseId(session.metadata?.orderId)

  if (event.type === 'checkout.session.completed' && orderId && session.payment_status === 'paid') {
    // Newer API versions put the address under collected_information
    const shipping = session.collected_information?.shipping_details ?? session.shipping_details
    // Matching the session id as well stops a mismatched order id being marked paid.
    // "status <> paid" makes a repeated delivery of the same event harmless.
    await db
      .update(orders)
      .set({
        status: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        shippingName: shipping?.name ?? null,
        shippingAddress: shipping?.address ?? null,
      })
      .where(and(eq(orders.id, orderId), eq(orders.stripeSessionId, session.id), ne(orders.status, 'paid')))
  }

  if (event.type === 'checkout.session.expired' && orderId) {
    await db
      .update(orders)
      .set({ status: 'cancelled' })
      .where(and(eq(orders.id, orderId), eq(orders.stripeSessionId, session.id), eq(orders.status, 'pending')))
  }

  // Any other event is acknowledged and ignored
  res.json({ received: true })
}
