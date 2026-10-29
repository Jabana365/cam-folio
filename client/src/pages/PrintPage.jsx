import { Link, useParams } from 'react-router'

// Placeholder: the product page is built in Phase 5
function PrintPage() {
  const { id } = useParams()
  return (
    <section className="px-page py-16">
      <h1 className="section-title">Print #{id}</h1>
      <p className="text-muted">Product page coming soon.</p>
      <Link to="/#gallery" className="text-accent">← Back to the gallery</Link>
    </section>
  )
}

export default PrintPage
