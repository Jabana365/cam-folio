import { db, pool } from './index.js'
import { photos } from './schema.js'
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
await pool.end()
