import { Router } from 'express'
import { and, desc, eq, gt } from 'drizzle-orm'
import { db } from '../db/index.js'
import { comments, photos, user } from '../db/schema.js'
import { getUser } from '../lib/getUser.js'

const router = Router()

const MAX_LENGTH = 500
const COOLDOWN_MS = 5000

// GET /api/photos/:id/comments -> newest first, with `mine` set for the caller's own
router.get('/photos/:id/comments', async (req, res) => {
  const photoId = Number(req.params.id)
  if (!Number.isInteger(photoId)) return res.status(400).json({ error: 'Invalid photo id' })
  const me = await getUser(req)
  const rows = await db
    .select({ id: comments.id, body: comments.body, createdAt: comments.createdAt, author: user.name, userId: comments.userId })
    .from(comments)
    .innerJoin(user, eq(user.id, comments.userId))
    .where(eq(comments.photoId, photoId))
    .orderBy(desc(comments.createdAt), desc(comments.id))
  res.json(rows.map(({ userId, ...c }) => ({ ...c, mine: userId === me?.id })))
})

// POST /api/photos/:id/comments  { body }  (signed-in only)
router.post('/photos/:id/comments', async (req, res) => {
  const me = await getUser(req)
  if (!me) return res.status(401).json({ error: 'Sign in to comment' })
  const photoId = Number(req.params.id)
  if (!Number.isInteger(photoId)) return res.status(400).json({ error: 'Invalid photo id' })
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
  if (!body || body.length > MAX_LENGTH) {
    return res.status(400).json({ error: `Comment must be 1 to ${MAX_LENGTH} characters` })
  }
  const [photo] = await db.select({ id: photos.id }).from(photos).where(eq(photos.id, photoId))
  if (!photo) return res.status(404).json({ error: 'Photo not found' })

  const [recent] = await db
    .select({ id: comments.id })
    .from(comments)
    .where(and(eq(comments.userId, me.id), gt(comments.createdAt, new Date(Date.now() - COOLDOWN_MS))))
    .limit(1)
  if (recent) return res.status(429).json({ error: 'Slow down: wait a few seconds between comments' })

  const [row] = await db.insert(comments).values({ userId: me.id, photoId, body }).returning()
  res.status(201).json({ id: row.id, body: row.body, createdAt: row.createdAt, author: me.name, mine: true })
})

// DELETE /api/comments/:id  (only the author can delete)
router.delete('/comments/:id', async (req, res) => {
  const me = await getUser(req)
  if (!me) return res.status(401).json({ error: 'Sign in first' })
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid comment id' })
  const deleted = await db
    .delete(comments)
    .where(and(eq(comments.id, id), eq(comments.userId, me.id)))
    .returning({ id: comments.id })
  if (deleted.length === 0) return res.status(404).json({ error: 'Comment not found' })
  res.status(204).end()
})

export default router
