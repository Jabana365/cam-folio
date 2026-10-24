import { useEffect } from 'react'
import Comments from './Comments'

function Lightbox({ photo, position, total, onClose, onPrev, onNext, onRequireAuth }) {
  // Keyboard shortcuts and page-scroll lock while the lightbox is open.
  // The cleanup function undoes both when it closes.
  useEffect(() => {
    function handleKey(event) {
      // Let arrows / Esc work normally while typing a comment
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') return
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowLeft') onPrev()
      else if (event.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  const buttonClasses =
    'cursor-pointer rounded-md border border-border bg-transparent px-4 py-1 text-text hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent'

  return (
    // Clicking the dark backdrop closes it; clicks inside the panel are stopped from reaching it
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      onClick={onClose}
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/85 p-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-[min(92vw,1100px)] flex-col overflow-y-auto rounded-md bg-surface"
      >
        <img src={photo.src} alt={photo.alt} className="max-h-[55vh] min-h-0 w-full shrink-0 bg-black object-contain" />
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="m-0 font-heading text-[1.1rem]">
            {photo.title} <span className="font-body text-[.9rem] text-accent">· {photo.location}</span>
            <span className="ml-2 rounded-full border border-accent/40 px-2 py-0.5 font-body text-[.7rem] tracking-[.15em] text-accent uppercase">
              {photo.category}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[.9rem] text-muted">
              {position} / {total}
            </span>
            <button type="button" onClick={onPrev} aria-label="Previous photo" className={buttonClasses}>
              ←
            </button>
            <button type="button" onClick={onNext} aria-label="Next photo" className={buttonClasses}>
              →
            </button>
            <button type="button" onClick={onClose} autoFocus className={buttonClasses}>
              Close
            </button>
          </div>
        </div>
        <Comments photoId={photo.id} onRequireAuth={onRequireAuth} />
      </div>
    </div>
  )
}

export default Lightbox
