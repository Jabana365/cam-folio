const looks = {
  paid: { label: 'Paid', className: 'border-green-500/50 text-green-400' },
  pending: { label: 'Awaiting payment', className: 'border-accent/50 text-accent' },
  cancelled: { label: 'Cancelled', className: 'border-border text-muted' },
}

function StatusBadge({ status }) {
  // An unknown status shows as itself instead of passing for "Awaiting payment"
  const look = looks[status] ?? { label: status, className: 'border-border text-muted' }
  return (
    <span className={`rounded-full border px-3 py-0.5 text-[.75rem] tracking-[.1em] uppercase ${look.className}`}>
      {look.label}
    </span>
  )
}

export default StatusBadge
