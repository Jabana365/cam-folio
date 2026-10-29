import { Router } from 'express'
import { asc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { printSizes, printFrames, printFinishes } from '../db/schema.js'

const router = Router()

// Everything on sale from one options table, in display order
const activeOptions = (table, columns) =>
  db.select(columns).from(table).where(eq(table.active, true)).orderBy(asc(table.sortOrder), asc(table.id))

// GET /api/shop/options -> the sizes, frames and finishes a print can be ordered in.
// Prices here are for display; the checkout route recalculates them from the database.
router.get('/options', async (req, res) => {
  const addOnColumns = (table) => ({ id: table.id, name: table.name, description: table.description, priceCents: table.priceCents })
  const [sizes, frames, finishes] = await Promise.all([
    activeOptions(printSizes, { id: printSizes.id, label: printSizes.label, priceCents: printSizes.basePriceCents }),
    activeOptions(printFrames, addOnColumns(printFrames)),
    activeOptions(printFinishes, addOnColumns(printFinishes)),
  ])
  res.json({ sizes, frames, finishes })
})

export default router
