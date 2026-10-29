import { db, pool } from './index.js'
import { photos, printSizes, printFrames, printFinishes } from './schema.js'
import { photos as seedPhotos } from './seedData.js'

// Safe to re-run: existing ids are updated instead of duplicated.
for (const p of seedPhotos) {
  const row = {
    id: p.id,
    src: p.src,
    alt: p.alt,
    title: p.title,
    location: p.location,
    description: p.description,
    category: p.category,
    size: p.size ?? null,
    baseRatingTotal: p.ratingTotal,
    baseRatingCount: p.ratingCount,
  }
  await db.insert(photos).values(row).onConflictDoUpdate({ target: photos.id, set: row })
}

console.log(`Seeded ${seedPhotos.length} photos`)

// Print shop options. Prices are in cents. Upserted by name/label so re-running
// the seed updates prices without creating duplicates.
const sizes = [
  { label: '8 × 12 in', basePriceCents: 3500 },
  { label: '12 × 18 in', basePriceCents: 6500 },
  { label: '16 × 24 in', basePriceCents: 11000 },
  { label: '24 × 36 in', basePriceCents: 19000 },
]
const frames = [
  { name: 'No frame', description: 'Print only, rolled in a protective tube.', priceCents: 0 },
  { name: 'Black wood', description: 'Solid black wood frame with a white mat.', priceCents: 6000 },
  { name: 'Natural wood', description: 'Light oak frame with a white mat.', priceCents: 6000 },
  { name: 'Glass front', description: 'Slim metal frame with museum-grade glass.', priceCents: 9500 },
  { name: 'Acrylic', description: 'Print face-mounted behind polished acrylic.', priceCents: 12000 },
  { name: 'Table stand', description: 'Mounted on rigid board with a tabletop easel stand.', priceCents: 2500 },
]
const finishes = [
  { name: 'Matte', description: 'Soft, glare-free finish.', priceCents: 0 },
  { name: 'Gloss', description: 'High-contrast finish with deeper blacks.', priceCents: 1000 },
]

// The list order becomes the display order
async function upsertOptions(table, target, rows) {
  for (const [i, option] of rows.entries()) {
    const row = { ...option, sortOrder: i }
    await db.insert(table).values(row).onConflictDoUpdate({ target, set: row })
  }
}
await upsertOptions(printSizes, printSizes.label, sizes)
await upsertOptions(printFrames, printFrames.name, frames)
await upsertOptions(printFinishes, printFinishes.name, finishes)
console.log(`Seeded ${sizes.length} sizes, ${frames.length} frames, ${finishes.length} finishes`)
await pool.end()
