import { Router } from 'express'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders, orderItems, photos } from '../db/schema.js'
import { requireUser } from '../middleware/requireUser.js'
import { parseId } from '../lib/parseId.js'

const router = Router()

const itemColumns = {
  orderId: orderItems.orderId,
  photoId: orderItems.photoId,
  title: photos.title,
  src: photos.src,
  quantity: orderItems.quantity,
  unitPriceCents: orderItems.unitPriceCents,
  sizeLabel: orderItems.sizeLabel,
  frameName: orderItems.frameName,
  finishName: orderItems.finishName,
}

const orderColumns = {
  id: orders.id,
  status: orders.status,
  totalCents: orders.totalCents,
  currency: orders.currency,
  createdAt: orders.createdAt,
  paidAt: orders.paidAt,
}

// Attach each order's items. One extra query for the whole list.
async function withItems(rows) {
  if (rows.length === 0) return []
  const items = await db
    .select(itemColumns)
    .from(orderItems)
    .innerJoin(photos, eq(photos.id, orderItems.photoId))
    .where(inArray(orderItems.orderId, rows.map((o) => o.id)))
  return rows.map((o) => ({
    ...o,
    items: items.filter((i) => i.orderId === o.id).map(({ orderId, ...i }) => i),
  }))
}

// GET /api/orders -> the signed-in user's orders, newest first
router.get('/', requireUser, async (req, res) => {
  const rows = await db
    .select(orderColumns)
    .from(orders)
    .where(eq(orders.userId, req.user.id))
    .orderBy(desc(orders.createdAt), desc(orders.id))
  res.json(await withItems(rows))
})

// GET /api/orders/:id -> one of the caller's orders. Read-only: the status only
// changes through the Stripe webhook.
router.get('/:id', requireUser, async (req, res) => {
  const id = parseId(req.params.id)
  if (id === null) return res.status(400).json({ error: 'Invalid order id' })
  const rows = await db
    .select(orderColumns)
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, req.user.id)))
  if (rows.length === 0) return res.status(404).json({ error: 'Order not found' })
  const [order] = await withItems(rows)
  res.json(order)
})

export default router
