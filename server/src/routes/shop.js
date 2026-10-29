import { Router } from 'express'
import { asc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { printSizes, printFrames, printFinishes } from '../db/schema.js'

const router = Router()

// GET /api/shop/options -> the sizes, frames and finishes a print can be ordered in.
// Prices here are for display; the checkout route recalculates them from the database.
router.get('/options', async (req, res) => {
  const [sizes, frames, finishes] = await Promise.all([
    db
      .select({ id: printSizes.id, label: printSizes.label, priceCents: printSizes.basePriceCents })
      .from(printSizes)
      .where(eq(printSizes.active, true))
      .orderBy(asc(printSizes.sortOrder), asc(printSizes.id)),
    db
      .select({ id: printFrames.id, name: printFrames.name, description: printFrames.description, priceCents: printFrames.priceCents })
      .from(printFrames)
      .where(eq(printFrames.active, true))
      .orderBy(asc(printFrames.sortOrder), asc(printFrames.id)),
    db
      .select({ id: printFinishes.id, name: printFinishes.name, description: printFinishes.description, priceCents: printFinishes.priceCents })
      .from(printFinishes)
      .where(eq(printFinishes.active, true))
      .orderBy(asc(printFinishes.sortOrder), asc(printFinishes.id)),
  ])
  res.json({ sizes, frames, finishes, currency: 'usd' })
})

export default router
