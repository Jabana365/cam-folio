import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { api } from '../lib/api'
import { useSession } from '../lib/auth-client'
import { formatPrice } from '../utils/money'

const MAX_QUANTITY = 10

// How each frame looks in the preview. Anything not listed shows the bare print.
const glare = 'linear-gradient(115deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,0) 45%)'
const frameLooks = {
  'Black wood': { border: '14px solid #1a1a1a', padding: 18, background: '#f4f1ea' },
  'Natural wood': { border: '14px solid #b98b57', padding: 18, background: '#f4f1ea' },
  'Glass front': { border: '6px solid #8d959b', padding: 16, background: '#f4f1ea', glare: true },
  Acrylic: { border: '1px solid rgba(255,255,255,.35)', padding: 0, background: 'transparent', glare: true, thick: true },
  'Table stand': { border: '8px solid #2a2f35', padding: 0, background: '#2a2f35', stand: true },
}

function Preview({ photo, frame }) {
  const look = frameLooks[frame?.name] ?? {}
  return (
    // A light "gallery wall" so dark frames and clear acrylic edges stay visible on the dark site
    <div className="flex flex-col items-center rounded-md bg-[#d4d0c7] p-6 sm:p-10">
      <div
        className="relative max-w-full"
        style={{
          border: look.border,
          padding: look.padding,
          background: look.background,
          boxShadow: look.thick ? '0 0 0 4px rgba(255,255,255,.12), 0 18px 40px rgba(0,0,0,.55)' : '0 14px 34px rgba(0,0,0,.5)',
        }}
      >
        <img src={photo.src} alt={photo.alt} className="block max-h-[60vh] max-w-full object-contain" />
        {look.glare && <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: glare }} />}
      </div>
      {look.stand && <div className="h-4 w-1/4 bg-[#2a2f35] [clip-path:polygon(15%_0,85%_0,100%_100%,0_100%)]" />}
    </div>
  )
}

function Group({ title, children }) {
  return (
    <fieldset className="m-0 mb-6 border-0 p-0">
      <legend className="mb-2 p-0 text-[.8rem] tracking-[.15em] text-muted uppercase">{title}</legend>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function Choice({ selected, onSelect, name, detail, price }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`cursor-pointer rounded-md border p-3 text-left transition-colors ${
        selected ? 'border-accent bg-accent/10' : 'border-border bg-transparent hover:border-accent'
      }`}
    >
      <span className="flex items-baseline justify-between gap-2 text-text">
        <span className="font-bold">{name}</span>
        <span className="text-[.85rem] text-accent">{price}</span>
      </span>
      {detail && <span className="mt-0.5 block text-[.8rem] leading-snug text-muted">{detail}</span>}
    </button>
  )
}

function PrintPage({ onRequireAuth }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { data: session } = useSession()
  const [photo, setPhoto] = useState(null)
  const [options, setOptions] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error' | 'missing'
  const [sizeId, setSizeId] = useState(null)
  const [frameId, setFrameId] = useState(null)
  const [finishId, setFinishId] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/photos'), api('/shop/options')])
      .then(([photos, opts]) => {
        const found = photos.find((p) => String(p.id) === id)
        if (!found) return setStatus('missing')
        setPhoto(found)
        setOptions(opts)
        setSizeId(opts.sizes[0]?.id ?? null)
        setFrameId(opts.frames[0]?.id ?? null)
        setFinishId(opts.finishes[0]?.id ?? null)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [id])

  // Coming back from Stripe with the browser's Back button restores this page
  // with the button still "busy", so reset it
  useEffect(() => {
    const reset = (event) => event.persisted && setBusy(false)
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  if (status === 'loading') return <p className="px-page py-16 text-muted">Loading…</p>
  if (status === 'error') return <p role="alert" className="px-page py-16 text-muted">Couldn't load this print. Please try again later.</p>
  if (status === 'missing') {
    return (
      <section className="px-page py-16">
        <h1 className="section-title">Photo not found</h1>
        <Link to="/#gallery" className="text-accent">← Back to the gallery</Link>
      </section>
    )
  }

  const size = options.sizes.find((s) => s.id === sizeId)
  const frame = options.frames.find((f) => f.id === frameId)
  const finish = options.finishes.find((f) => f.id === finishId)
  const unitCents = (size?.priceCents ?? 0) + (frame?.priceCents ?? 0) + (finish?.priceCents ?? 0)

  // Only ids and quantity are sent. The server looks up the real prices.
  async function startCheckout(choice) {
    setError('')
    setBusy(true)
    try {
      const { url } = await api('/checkout', { method: 'POST', body: choice })
      window.location.assign(url)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  function handleBuy() {
    const choice = { photoId: photo.id, sizeId, frameId, finishId, quantity }
    // Signed out: ask them to sign in, then carry straight on to Stripe with the same choices
    if (!session) return onRequireAuth('buy', () => startCheckout(choice))
    startCheckout(choice)
  }

  return (
    <section className="px-page py-10">
      <Link to="/#gallery" className="text-[.9rem] text-accent no-underline">← Back to the gallery</Link>
      {searchParams.get('checkout') === 'cancelled' && (
        <p role="status" className="mt-4 mb-0 rounded-md border border-border bg-surface px-4 py-3 text-[.9rem] text-muted">
          Checkout cancelled. You haven't been charged.
        </p>
      )}

      <div className="mt-6 grid items-start gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Preview photo={photo} frame={frame} />
          <h1 className="mt-6 mb-1 font-heading text-[2rem] leading-tight font-normal">{photo.title}</h1>
          <p className="m-0 text-accent">{photo.location}</p>
          <p className="mt-3 text-muted">{photo.description}</p>
          <ul className="mt-4 list-disc pl-5 text-[.9rem] text-muted">
            <li>Archival pigment print on museum-grade fine art paper</li>
            <li>Printed to order and signed on the back by the photographer</li>
            <li>Ships worldwide in 5 to 10 business days</li>
            <li>30-day returns if it arrives damaged</li>
          </ul>
        </div>

        <div className="md:sticky md:top-20">
          <Group title="Size">
            {options.sizes.map((s) => (
              <Choice key={s.id} selected={s.id === sizeId} onSelect={() => setSizeId(s.id)} name={s.label} price={formatPrice(s.priceCents)} />
            ))}
          </Group>
          <Group title="Frame">
            {options.frames.map((f) => (
              <Choice
                key={f.id}
                selected={f.id === frameId}
                onSelect={() => setFrameId(f.id)}
                name={f.name}
                detail={f.description}
                price={f.priceCents ? `+${formatPrice(f.priceCents)}` : 'Included'}
              />
            ))}
          </Group>
          <Group title="Finish">
            {options.finishes.map((f) => (
              <Choice
                key={f.id}
                selected={f.id === finishId}
                onSelect={() => setFinishId(f.id)}
                name={f.name}
                detail={f.description}
                price={f.priceCents ? `+${formatPrice(f.priceCents)}` : 'Included'}
              />
            ))}
          </Group>

          <div className="rounded-md border border-border bg-surface p-4">
            <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[.9rem]">
              <dt className="text-muted">{size?.label}</dt>
              <dd className="m-0 text-right">{formatPrice(size?.priceCents ?? 0)}</dd>
              <dt className="text-muted">{frame?.name}</dt>
              <dd className="m-0 text-right">{formatPrice(frame?.priceCents ?? 0)}</dd>
              <dt className="text-muted">{finish?.name} finish</dt>
              <dd className="m-0 text-right">{formatPrice(finish?.priceCents ?? 0)}</dd>
            </dl>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <span id="qty-label" className="text-[.9rem] text-muted">Qty</span>
                <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="h-8 w-8 cursor-pointer rounded-md border border-border bg-transparent text-text disabled:cursor-default disabled:opacity-40">−</button>
                <span aria-labelledby="qty-label" className="w-6 text-center">{quantity}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))} disabled={quantity >= MAX_QUANTITY} className="h-8 w-8 cursor-pointer rounded-md border border-border bg-transparent text-text disabled:cursor-default disabled:opacity-40">+</button>
              </div>
              <p className="m-0 font-heading text-[1.5rem]">{formatPrice(unitCents * quantity)}</p>
            </div>
            {error && <p role="alert" className="mt-3 mb-0 text-[.9rem] text-red-400">{error}</p>}
            <button type="button" onClick={handleBuy} disabled={busy} className="btn-primary mt-4 w-full disabled:cursor-default disabled:opacity-60">
              {busy ? 'Taking you to checkout…' : 'Buy now'}
            </button>
            <p className="mt-2 mb-0 text-center text-[.8rem] text-muted">
              Secure payment by Stripe. Shipping address is collected at checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PrintPage
