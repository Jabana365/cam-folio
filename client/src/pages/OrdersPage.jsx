import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../lib/api'
import { useSession } from '../lib/auth-client'
import { formatDate } from '../utils/date'
import { formatPrice } from '../utils/money'
import OrderItems from '../components/OrderItems'
import SignInPrompt from '../components/SignInPrompt'
import StatusBadge from '../components/StatusBadge'

function OrdersPage({ onRequireAuth }) {
  const { data: session, isPending } = useSession()
  const userId = session?.user?.id
  const [orders, setOrders] = useState([])
  const [state, setState] = useState('loading') // 'loading' | 'ready' | 'error'

  useEffect(() => {
    if (!userId) return
    api('/orders')
      .then((list) => {
        setOrders(list)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [userId])

  if (isPending) return <p className="px-page py-16 text-muted">Loading…</p>
  if (!session) {
    return <SignInPrompt title="My orders" message="Sign in to see your orders." onSignIn={() => onRequireAuth(null)} />
  }

  return (
    <section className="px-page py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="section-title">My orders</h1>
        {state === 'loading' && <p className="text-muted">Loading your orders…</p>}
        {state === 'error' && <p role="alert" className="text-muted">Couldn't load your orders. Please try again later.</p>}
        {state === 'ready' && orders.length === 0 && (
          <div className="rounded-md border border-border bg-surface px-4 py-10 text-center">
            <p className="mt-0 mb-4 text-muted">You haven't ordered any prints yet.</p>
            <Link to="/#gallery" className="btn-primary inline-block no-underline">Browse the gallery</Link>
          </div>
        )}
        {state === 'ready' && orders.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {orders.map((order) => (
              <li key={order.id} className="rounded-md border border-border bg-surface p-5">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <Link to={`/order/${order.id}`} className="text-[1.05rem] text-text hover:text-accent">
                    Order #{order.id}
                  </Link>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-0 mb-3 text-[.85rem] text-muted">{formatDate(order.createdAt)}</p>
                <OrderItems items={order.items} />
                <p className="mt-2 mb-0 border-t border-border pt-3 text-right">
                  <span className="mr-3 text-muted">Total</span>
                  <span className="font-heading text-[1.2rem]">{formatPrice(order.totalCents)}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default OrdersPage
