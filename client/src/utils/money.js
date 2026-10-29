const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Prices travel as whole cents; this is the only place they become "$65.00"
export function formatPrice(cents) {
  return usd.format(cents / 100)
}

// "+$60.00" for an extra, "Included" when it costs nothing
export function formatAddOn(cents) {
  return cents ? `+${formatPrice(cents)}` : 'Included'
}
