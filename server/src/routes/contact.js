import { Router } from 'express'
import { db } from '../db/index.js'
import { contactMessages } from '../db/schema.js'

const router = Router()

// POST /api/contact -> stores a message from the contact form
router.post('/', async (req, res) => {
  const { name, email, shoot, documentary, docType, message } = req.body ?? {}
  if (![name, email, message].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'Name, email and message are required' })
  }
  await db.insert(contactMessages).values({
    name: name.trim(),
    email: email.trim(),
    shoot: shoot || null,
    documentary: documentary === true || documentary === 'yes',
    docType: docType || null,
    message: message.trim(),
  })
  res.status(201).json({ ok: true })
})

export default router
