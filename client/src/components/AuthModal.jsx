import { useState } from 'react'
import { signIn, signUp } from '../lib/auth-client'

const labelClasses = 'text-[.9rem] text-muted'

function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    setBusy(true)
    const { error } =
      mode === 'signup'
        ? await signUp.email({ name: form.get('name'), email: form.get('email'), password: form.get('password') })
        : await signIn.email({ email: form.get('email'), password: form.get('password') })
    setBusy(false)
    if (error) setError(error.message || 'Something went wrong')
    else onClose()
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'signup' ? 'Create account' : 'Sign in'}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-md border border-border bg-surface p-6"
      >
        <h2 className="section-title mb-4 text-[1.5rem]">{mode === 'signup' ? 'Create account' : 'Sign in'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-name" className={labelClasses}>Name</label>
              <input id="auth-name" name="name" type="text" required className="field" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className={labelClasses}>Email</label>
            <input id="auth-email" name="email" type="email" required className="field" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className={labelClasses}>Password</label>
            <input id="auth-password" name="password" type="password" required minLength={8} className="field" />
          </div>
          {error && <p role="alert" className="m-0 text-[.9rem] text-red-400">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Please wait…' : mode === 'signup' ? 'Sign up' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 mb-0 text-center text-[.9rem] text-muted">
          {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup')
              setError('')
            }}
            className="cursor-pointer border-0 bg-transparent p-0 text-accent underline"
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthModal
