import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth, clientOrigins } from './auth.js'
import photosRouter from './routes/photos.js'
import contactRouter from './routes/contact.js'
import commentsRouter from './routes/comments.js'

const app = express()

app.use(cors({ origin: clientOrigins, credentials: true }))

// Better Auth must be mounted before express.json()
app.all('/api/auth/{*splat}', toNodeHandler(auth))

app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/photos', photosRouter)
app.use('/api/contact', contactRouter)
app.use('/api', commentsRouter)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`API listening on port ${port}`))
