import { Router } from 'express'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders, orderItems, photos, printSizes, printFrames, printFinishes } from '../db/schema.js'
import { requireUser } from '../middleware/requireUser.js'
import { parseId } from '../lib/parseId.js'
import { stripe } from '../lib/stripe.js'
import { clientOrigins } from '../auth.js'

const router = Router()

const MAX_QUANTITY = 10
const SESSION_LIFETIME_S = 31 * 60 // Stripe's minimum is 30 minutes
const SHIP_TO = ['US', 'CA', 'GB', 'AU', 'IE', 'DE', 'FR', 'NL', 'ES', 'IT', 'SE', 'NO', 'DK']

// A shop option (size, frame or finish) by id, only if it is still on sale
const findActive = (table, id) =>
  db.select().from(table).where(and(eq(table.id, id), eq(table.active, true)))

// POST /api/checkout  { photoId, sizeId, frameId, finishId, quantity }  (signed-in only)
// The browser only says WHAT it wants. The price is always looked up here.
router.post('/', requireUser, async (req, res) => {
  const photoId = parseId(req.body?.photoId)
  const sizeId = parseId(req.body?.sizeId)
  const frameId = parseId(req.body?.frameId)
  const finishId = parseId(req.body?.finishId)
  const quantity = Number(req.body?.quantity ?? 1)
  if (!photoId || !sizeId || !frameId || !finishId) {
    return res.status(400).json({ error: 'Choose a size, frame and finish' })
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return res.status(400).json({ error: `Quantity must be 1 to ${MAX_QUANTITY}` })
  }

  const [[photo], [size], [frame], [finish]] = await Promise.all([
    db.select({ title: photos.title, src: photos.src }).from(photos).where(eq(photos.id, photoId)),
    findActive(printSizes, sizeId),
    findActive(printFrames, frameId),
    findActive(printFinishes, finishId),
  ])
  if (!photo) return res.status(404).json({ error: 'Photo not found' })
  if (!size || !frame || !finish) return res.status(400).json({ error: 'That option is no longer available' })

  const unitPriceCents = size.basePriceCents + frame.priceCents + finish.priceCents
  const totalCents = unitPriceCents * quantity

  // The order and its item are saved together, still "pending" until Stripe confirms payment
  const order = await db.transaction(async (tx) => {
    const [o] = await tx.insert(orders).values({ userId: req.user.id, totalCents }).returning()
    await tx.insert(orderItems).values({
      orderId: o.id,
      photoId,
      quantity,
      unitPriceCents,
      sizeLabel: size.label,
      frameName: frame.name,
      finishName: finish.name,
    })
    return o
  })

  try {
    const base = clientOrigins[0]
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: req.user.email,
      client_reference_id: String(order.id),
      metadata: { orderId: String(order.id) },
      expires_at: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_S,
      shipping_address_collection: { allowed_countries: SHIP_TO },
      line_items: [
        {
          quantity,
          price_data: {
            currency: order.currency,
            unit_amount: unitPriceCents,
            product_data: {
              name: `${photo.title} — fine art print`,
              description: `${size.label}, ${frame.name}, ${finish.name}`,
              // Stripe only accepts absolute image URLs
              ...(/^https?:\/\//.test(photo.src) ? { images: [photo.src] } : {}),
            },
          },
        },
      ],
      success_url: `${base}/order/${order.id}?checkout=success`,
      cancel_url: `${base}/print/${photoId}?checkout=cancelled`,
    })
    await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id))
    res.status(201).json({ url: session.url, orderId: order.id })
  } catch (err) {
    console.error('Stripe session failed', err)
    await db.update(orders).set({ status: 'cancelled' }).where(eq(orders.id, order.id))
    res.status(502).json({ error: 'Could not start checkout, please try again' })
  }
})

export default router
