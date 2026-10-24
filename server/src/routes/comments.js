import { Router } from 'express'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { comments, photos, user } from '../db/schema.js'
import { getUser } from '../lib/getUser.js'

const router = Router()

const MAX_LENGTH = 500
const MAX_RAW_LENGTH = 2000 // reject absurd payloads before trimming
const COOLDOWN_MS = 5000
const PAGE_SIZE = 100
const MAX_INT = 2147483647 // largest value an integer column can hold

// Strict id parsing: digits only and within the integer range, else null
function parseId(value) {
  if (!/^\d+$/.test(value)) return null
  const n = Number(value)
  return n >= 1 && n <= MAX_INT ? n : null
}

// GET /api/photos/:id/comments -> newest first, with `mine` set for the caller's own
router.get('/photos/:id/comments', async (req, res) => {
  const photoId = parseId(req.params.id)
  if (photoId === null) return res.status(400).json({ error: 'Invalid photo id' })
  const me = await getUser(req)
  const rows = await db
    .select({ id: comments.id, body: comments.body, createdAt: comments.createdAt, author: user.name, userId: comments.userId })
    .from(comments)
    .innerJoin(user, eq(user.id, comments.userId))
    .where(eq(comments.photoId, photoId))
    .orderBy(desc(comments.createdAt), desc(comments.id))
    .limit(PAGE_SIZE)
  res.json(rows.map(({ userId, ...c }) => ({ ...c, mine: userId === me?.id })))
})

// POST /api/photos/:id/comments  { body }  (signed-in only)
router.post('/photos/:id/comments', async (req, res) => {
  const me = await getUser(req)
  if (!me) return res.status(401).json({ error: 'Sign in to comment' })
  const photoId = parseId(req.params.id)
  if (photoId === null) return res.status(400).json({ error: 'Invalid photo id' })
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
  if (!body || body.length > MAX_LENGTH || req.body.body.length > MAX_RAW_LENGTH) {
    return res.status(400).json({ error: `Comment must be 1 to ${MAX_LENGTH} characters` })
  }
  const [photo] = await db.select({ id: photos.id }).from(photos).where(eq(photos.id, photoId))
  if (!photo) return res.status(404).json({ error: 'Photo not found' })

  // The advisory lock serialises one user's posts, so two simultaneous requests can't
  // both pass the cooldown check. The cooldown is per user (not per photo) on purpose,
  // otherwise spamming could be spread across photos.
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${me.id}))`)
    // Compare inside the database so Node's clock and timezone never enter into it
    const [last] = await tx
      .select({
        wait: sql`ceil(extract(epoch from (${comments.createdAt} + ${COOLDOWN_MS} * interval '1 millisecond' - now())))`.mapWith(Number),
      })
      .from(comments)
      .where(and(eq(comments.userId, me.id), sql`${comments.createdAt} > now() - ${COOLDOWN_MS} * interval '1 millisecond'`))
      .orderBy(desc(comments.createdAt))
      .limit(1)
    if (last) return { wait: Math.max(1, last.wait) }
    const [inserted] = await tx.insert(comments).values({ userId: me.id, photoId, body }).returning()
    return { row: inserted }
  })
  if (result.wait) {
    res.set('Retry-After', String(result.wait))
    return res.status(429).json({ error: `Slow down: wait ${result.wait}s before commenting again` })
  }
  const row = result.row
  res.status(201).json({ id: row.id, body: row.body, createdAt: row.createdAt, author: me.name, mine: true })
})

// DELETE /api/comments/:id  (only the author can delete)
router.delete('/comments/:id', async (req, res) => {
  const me = await getUser(req)
  if (!me) return res.status(401).json({ error: 'Sign in first' })
  const id = parseId(req.params.id)
  if (id === null) return res.status(400).json({ error: 'Invalid comment id' })
  const deleted = await db
    .delete(comments)
    .where(and(eq(comments.id, id), eq(comments.userId, me.id)))
    .returning({ id: comments.id })
  if (deleted.length === 0) return res.status(404).json({ error: 'Comment not found' })
  res.status(204).end()
})

export default router
