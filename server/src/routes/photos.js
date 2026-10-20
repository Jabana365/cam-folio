import { Router } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { sql, eq, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { photos, ratings } from '../db/schema.js'
import { auth } from '../auth.js'

const router = Router()

async function getUser(req) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
  return session?.user ?? null
}

// GET /api/photos -> every photo with community totals (+ the caller's own rating)
router.get('/', async (req, res) => {
  const user = await getUser(req)
  const rows = await db
    .select({
      id: photos.id,
      src: photos.src,
      alt: photos.alt,
      title: photos.title,
      location: photos.location,
      description: photos.description,
      category: photos.category,
      size: photos.size,
      ratingTotal: sql`${photos.baseRatingTotal} + coalesce((select sum(value) from ratings where ratings.photo_id = ${photos.id}), 0)`.mapWith(Number),
      ratingCount: sql`${photos.baseRatingCount} + (select count(*) from ratings where ratings.photo_id = ${photos.id})`.mapWith(Number),
    })
    .from(photos)
    .orderBy(photos.id)

  let mine = {}
  if (user) {
    const own = await db.select().from(ratings).where(eq(ratings.userId, user.id))
    mine = Object.fromEntries(own.map((r) => [r.photoId, r.value]))
  }
  res.json(rows.map((p) => ({ ...p, myRating: mine[p.id] ?? 0 })))
})

// PUT /api/photos/:id/rating  { value: 1-5 }  (signed-in only)
router.put('/:id/rating', async (req, res) => {
  const user = await getUser(req)
  if (!user) return res.status(401).json({ error: 'Sign in to rate photos' })
  const photoId = Number(req.params.id)
  const value = Number(req.body?.value)
  if (!Number.isInteger(photoId) || !Number.isInteger(value) || value < 1 || value > 5) {
    return res.status(400).json({ error: 'value must be an integer from 1 to 5' })
  }
  const [photo] = await db.select({ id: photos.id }).from(photos).where(eq(photos.id, photoId))
  if (!photo) return res.status(404).json({ error: 'Photo not found' })
  await db
    .insert(ratings)
    .values({ userId: user.id, photoId, value })
    .onConflictDoUpdate({ target: [ratings.userId, ratings.photoId], set: { value } })
  res.json({ photoId, value })
})

// DELETE /api/photos/:id/rating  (clears the caller's rating)
router.delete('/:id/rating', async (req, res) => {
  const user = await getUser(req)
  if (!user) return res.status(401).json({ error: 'Sign in to rate photos' })
  const photoId = Number(req.params.id)
  if (!Number.isInteger(photoId)) return res.status(400).json({ error: 'Invalid photo id' })
  await db.delete(ratings).where(and(eq(ratings.userId, user.id), eq(ratings.photoId, photoId)))
  res.status(204).end()
})

export default router
