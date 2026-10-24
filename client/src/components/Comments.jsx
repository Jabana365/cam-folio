import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useSession } from '../lib/auth-client'

function Comments({ photoId, onRequireAuth }) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [comments, setComments] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Reload when the photo changes or the user signs in/out (so "mine" is right)
  useEffect(() => {
    let cancelled = false // ignore a slow response once the photo or user has changed
    setStatus('loading')
    api(`/photos/${photoId}/comments`)
      .then((data) => {
        if (cancelled) return
        setComments(data)
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [photoId, userId])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    setError('')
    try {
      const created = await api(`/photos/${photoId}/comments`, { method: 'POST', body: { body: text } })
      setComments((list) => [created, ...list])
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api(`/comments/${id}`, { method: 'DELETE' })
      setComments((list) => list.filter((c) => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section aria-label="Comments" className="flex shrink-0 flex-col gap-3 border-t border-border px-4 py-3">
      <h3 className="m-0 font-heading text-[1rem]">Comments ({comments.length})</h3>

      <div className="sm:max-h-48 sm:overflow-y-auto">
        {status === 'loading' ? (
          <p className="m-0 text-muted">Loading comments…</p>
        ) : status === 'error' ? (
          <p role="alert" className="m-0 text-muted">Couldn't load comments.</p>
        ) : comments.length === 0 ? (
          <p className="m-0 text-muted">No comments yet. Be the first.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {comments.map((c) => (
              <li key={c.id} className="text-[.9rem]">
                <div className="flex items-center justify-between gap-2">
                  <span>
                    <strong>{c.author}</strong>{' '}
                    <span className="text-[.75rem] text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </span>
                  {c.mine && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      aria-label="Delete your comment"
                      className="cursor-pointer border-0 bg-transparent p-0 text-[.75rem] text-muted hover:text-accent"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="m-0 break-words whitespace-pre-wrap">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {session && status === 'ready' ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Add a comment"
            aria-label="Add a comment"
            className="field resize-y"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[.75rem] text-muted">{text.length}/500</span>
            <button type="submit" disabled={busy || !text.trim()} className="btn-primary">
              {busy ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      ) : !session ? (
        <button type="button" onClick={() => onRequireAuth('comment')} className="btn-primary self-start">
          Sign in to comment
        </button>
      ) : null}
      {error && <p role="alert" className="m-0 text-[.9rem] text-red-400">{error}</p>}

    </section>
  )
}

export default Comments
