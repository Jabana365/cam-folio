import { createAuthClient } from 'better-auth/react'

// No baseURL: requests go to this site's own /api/auth. In dev Vite proxies /api to
// the Express server; in production Vercel rewrites /api to the Railway server.
export const authClient = createAuthClient()
export const { useSession, signIn, signUp, signOut } = authClient
