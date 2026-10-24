import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/index.js'
import * as schema from './db/schema.js'

// Use only the origin of BETTER_AUTH_URL so a trailing slash or stray path
// can't change where Better Auth mounts its routes.
const baseURL = process.env.BETTER_AUTH_URL ? new URL(process.env.BETTER_AUTH_URL).origin : undefined

// Accept a comma-separated list and ignore trailing slashes / whitespace.
export const clientOrigins = (process.env.CLIENT_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)
  .map((o) => new URL(o).origin)

export const auth = betterAuth({
  baseURL,
  basePath: '/api/auth',
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true },
  trustedOrigins: clientOrigins,
  // Sessions are stored in the database and sent as an httpOnly cookie,
  // so they survive a page refresh.
})
