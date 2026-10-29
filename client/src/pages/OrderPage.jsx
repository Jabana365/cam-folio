import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { api } from '../lib/api'
import { useSession } from '../lib/auth-client'
import { formatDate } from '../utils/date'
import { formatPrice } from '../utils/money'
import OrderItems from '../components/OrderItems'
import SignInPrompt from '../components/SignInPrompt'
import StatusBadge from '../components/StatusBadge'

const POLL_MS = 1500
const MAX_POLLS = 8 // the webhook can arrive a moment after Stripe redirects back

// The headline for the order's state. Only the paid one is green.
function Banner({ tone = 'plain', title, children }) {
  const colours = tone === 'good' ? 'border-green-500/40 bg-green-500/10' : 'border-border bg-surface'
  return (
    <div role="status" className={`mb-6 rounded-md border px-5 py-4 ${colours}`}>
      <h1 className="m-0 font-heading text-[1.6rem] font-normal">{title}</h1>
      {children}
    </div>
  )
}

function OrderPage({ onRequireAuth }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const fromStripe = searchParams.get('checkout') === 'success'
  const { data: session, isPending } = useSession()
  const userId = session?.user?.id
  const [order, setOrder] = useState(null)
  const [state, setState] = useState('loading') // 'loading' | 'ready' | 'missing' | 'error'
  const [gaveUp, setGaveUp] = useState(false) // still pending after the last check
  const [attempt, setAttempt] = useState(0) // bumped by the Check again button

  // Ask the server for the order. Only the Stripe webhook can mark it paid, so while it
  // is still pending after a successful checkout, check again a few times.
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    let timer
    let polls = 0
    async function load() {
      try {
        const found = await api(`/orders/${id}`)
        if (cancelled) return
        setOrder(found)
        setState('ready')
        if (found.status === 'pending' && fromStripe) {
          if (polls++ < MAX_POLLS) timer = setTimeout(load, POLL_MS)
          else setGaveUp(true)
        }
      } catch (err) {
        if (cancelled) return
        setState(err.status === 404 || err.status === 400 ? 'missing' : 'error')
      }
    }
    load()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [id, userId, fromStripe, attempt])

  const back = <Link to="/#gallery" className="text-accent">← Back to the gallery</Link>

  if (isPending) return <p className="px-page py-16 text-muted">Loading…</p>
  if (!session) {
    return <SignInPrompt title={`Order #${id}`} message="Sign in to see this order." onSignIn={() => onRequireAuth(null)} />
  }
  if (state === 'loading') return <p className="px-page py-16 text-muted">Loading your order…</p>
  if (state === 'missing') {
    return (
      <section className="px-page py-16">
        <h1 className="section-title">Order not found</h1>
        {back}
      </section>
    )
  }
  if (state === 'error') {
    return <p role="alert" className="px-page py-16 text-muted">Couldn't load this order. Please try again later.</p>
  }

  const note = 'mt-1 mb-0 text-muted'
  const waiting = order.status === 'pending' && fromStripe && !gaveUp

  return (
    <section className="px-page py-16">
      <div className="mx-auto max-w-2xl">
        {order.status === 'paid' && (
          <Banner tone="good" title="Payment confirmed. Thank you!">
            <p className={note}>Your print is being prepared. You will get shipping updates by email.</p>
          </Banner>
        )}
        {waiting && (
          <Banner title="Confirming your payment…">
            <p className={note}>This usually takes a few seconds.</p>
          </Banner>
        )}
        {order.status === 'pending' && !waiting && (
          <Banner title={fromStripe ? 'Still processing your payment' : 'This order has not been paid'}>
            <p className="mt-1 mb-3 text-muted">
              {fromStripe
                ? "We haven't received the confirmation from Stripe yet. It can take a little longer."
                : 'No payment has been received for it.'}
            </p>
            {fromStripe && (
              <button
                type="button"
                onClick={() => {
                  setGaveUp(false)
                  setAttempt((n) => n + 1)
                }}
                className="btn-primary"
              >
                Check again
              </button>
            )}
          </Banner>
        )}
        {order.status === 'cancelled' && (
          <Banner title="Checkout cancelled">
            <p className={note}>You haven't been charged for this order.</p>
          </Banner>
        )}

        <div className="rounded-md border border-border bg-surface p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-[1.1rem]">Order #{order.id}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-0 mb-3 text-[.85rem] text-muted">Placed {formatDate(order.createdAt)}</p>
          <OrderItems items={order.items} />
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <span className="text-muted">Total</span>
            <span className="font-heading text-[1.4rem]">{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        <p className="mt-6 mb-0 flex flex-wrap gap-x-6 gap-y-2">
          {back}
          <Link to="/orders" className="text-accent">View all my orders</Link>
        </p>
      </div>
    </section>
  )
}

export default OrderPage
