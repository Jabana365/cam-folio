import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth, clientOrigins } from './auth.js'
import photosRouter from './routes/photos.js'
import contactRouter from './routes/contact.js'
import commentsRouter from './routes/comments.js'
import shopRouter from './routes/shop.js'
import checkoutRouter from './routes/checkout.js'
import ordersRouter from './routes/orders.js'
import { stripeWebhook } from './routes/stripeWebhook.js'

const app = express()

app.use(cors({ origin: clientOrigins, credentials: true }))

// Better Auth must be mounted before express.json()
app.all('/api/auth/{*splat}', toNodeHandler(auth))

// Stripe signs the exact bytes it sends, so this route needs the raw body
// and must also be mounted before express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook)

app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/photos', photosRouter)
app.use('/api/shop', shopRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/contact', contactRouter)
app.use('/api', commentsRouter)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`API listening on port ${port}`))
