import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../auth.js'

// The signed-in user for this request, or null
export async function getUser(req) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
  return session?.user ?? null
}
