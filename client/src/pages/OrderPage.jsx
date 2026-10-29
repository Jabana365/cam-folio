import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { api } from '../lib/api'
import { useSession } from '../lib/auth-client'
import { formatPrice } from '../utils/money'
import OrderItems from '../components/OrderItems'
import StatusBadge from '../components/StatusBadge'

const POLL_MS = 1500
const MAX_POLLS = 8 // the webhook can arrive a moment after Stripe redirects back

function OrderPage({ onRequireAuth }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const fromStripe = searchParams.get('checkout') === 'success'
  const { data: session, isPending } = useSession()
  const userId = session?.user?.id
  const [order, setOrder] = useState(null)
  const [state, setState] = useState('loading') // 'loading' | 'ready' | 'missing' | 'error'
  const [gaveUp, setGaveUp] = useState(false) // still pending after the last check
  const [attempt, setAttempt] = useState(0) // bumped by the Refresh button

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
        setState(/not found|invalid/i.test(err.message) ? 'missing' : 'error')
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
    return (
      <section className="px-page py-16">
        <h1 className="section-title">Order #{id}</h1>
        <p className="text-muted">Sign in to see this order.</p>
        <button type="button" onClick={() => onRequireAuth(null)} className="btn-primary">Sign in</button>
      </section>
    )
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

  const paid = order.status === 'paid'
  const waiting = order.status === 'pending' && fromStripe && !gaveUp

  return (
    <section className="px-page py-16">
      <div className="mx-auto max-w-2xl">
        {paid && (
          <div role="status" className="mb-6 rounded-md border border-green-500/40 bg-green-500/10 px-5 py-4">
            <h1 className="m-0 font-heading text-[1.6rem] font-normal">Payment confirmed. Thank you!</h1>
            <p className="mt-1 mb-0 text-muted">Your print is being prepared. You will get shipping updates by email.</p>
          </div>
        )}
        {waiting && (
          <div role="status" className="mb-6 rounded-md border border-border bg-surface px-5 py-4">
            <h1 className="m-0 font-heading text-[1.6rem] font-normal">Confirming your payment…</h1>
            <p className="mt-1 mb-0 text-muted">This usually takes a few seconds.</p>
          </div>
        )}
        {order.status === 'pending' && !waiting && (
          <div role="status" className="mb-6 rounded-md border border-border bg-surface px-5 py-4">
            <h1 className="m-0 font-heading text-[1.6rem] font-normal">
              {fromStripe ? 'Still processing your payment' : 'This order has not been paid'}
            </h1>
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
          </div>
        )}
        {order.status === 'cancelled' && (
          <div role="status" className="mb-6 rounded-md border border-border bg-surface px-5 py-4">
            <h1 className="m-0 font-heading text-[1.6rem] font-normal">Checkout cancelled</h1>
            <p className="mt-1 mb-0 text-muted">You haven't been charged for this order.</p>
          </div>
        )}

        <div className="rounded-md border border-border bg-surface p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-[1.1rem]">Order #{order.id}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-0 mb-3 text-[.85rem] text-muted">
            Placed {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </p>
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
