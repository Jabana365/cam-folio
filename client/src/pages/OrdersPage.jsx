import { Link } from 'react-router'

// Placeholder: the order history is built in Phase 6
function OrdersPage() {
  return (
    <section className="px-page py-16">
      <h1 className="section-title">My orders</h1>
      <p className="text-muted">Order history coming soon.</p>
      <Link to="/#gallery" className="text-accent">← Back to the gallery</Link>
    </section>
  )
}

export default OrdersPage
