import { getUser } from '../lib/getUser.js'

// Blocks the request unless someone is signed in. The user is put on req.user,
// so every order can be tied to a real account.
export async function requireUser(req, res, next) {
  const me = await getUser(req)
  if (!me) return res.status(401).json({ error: 'Sign in to continue' })
  req.user = me
  next()
}
