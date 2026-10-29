import { Link, useParams } from 'react-router'

// Placeholder: the order status page is built in Phase 6
function OrderPage() {
  const { id } = useParams()
  return (
    <section className="px-page py-16">
      <h1 className="section-title">Order #{id}</h1>
      <p className="text-muted">Order status coming soon.</p>
      <Link to="/#gallery" className="text-accent">← Back to the gallery</Link>
    </section>
  )
}

export default OrderPage
