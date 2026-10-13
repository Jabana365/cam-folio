// Controlled component: it keeps no state of its own.
// `value` comes from the parent, and clicks are reported back through `onChange`.
const STARS = [1, 2, 3, 4, 5]

function StarRating({ value, onChange, label }) {
  return (
    <div role="group" aria-label={`Rate ${label}`} className="flex">
      {STARS.map((star) => {
        const filled = star <= value
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-pressed={filled}
            className={`cursor-pointer border-0 bg-transparent px-0.5 text-xl leading-none transition-colors hover:text-accent focus-visible:text-accent ${
              filled ? 'text-accent' : 'text-text/50'
            }`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

export default StarRating
