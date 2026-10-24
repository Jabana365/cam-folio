import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useSession } from '../lib/auth-client'
import { getCommunityStats } from '../utils/ratings'
import PhotoCard from './PhotoCard'
import Lightbox from './Lightbox'

function Gallery({ onRequireAuth }) {
  const { data: session } = useSession()
  const userId = session?.user.id
  const [photos, setPhotos] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('all') // 'all' | 'mine' (only photos the user rated)
  const [sortBy, setSortBy] = useState('default')
  const [openIndex, setOpenIndex] = useState(null) // which visible photo the lightbox shows, or null

  // Load photos from the API. Re-runs when the user signs in or out so myRating is right.
  useEffect(() => {
    api('/photos')
      .then((data) => {
        setPhotos(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [userId])

  // "All" plus each category found in the data, in first-seen order
  // Signed-out users always see everything
  const showMine = view === 'mine' && Boolean(session)
  const categories = ['All', ...new Set(photos.map((photo) => photo.category))]

  // Everything below is derived on every render from the state above, never stored separately.
  // .filter() returns a new array, so sorting it in place never touches the original `photos`.
  const query = search.trim().toLowerCase()
  const visiblePhotos = photos.filter(
    (photo) =>
      (!showMine || photo.myRating > 0) &&
      (category === 'All' || photo.category === category) &&
      `${photo.title} ${photo.location}`.toLowerCase().includes(query),
  )

  function averageOf(photo) {
    return getCommunityStats(photo).average
  }

  if (sortBy === 'title') {
    visiblePhotos.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy === 'location') {
    visiblePhotos.sort((a, b) => a.location.localeCompare(b.location))
  } else if (sortBy === 'rating') {
    visiblePhotos.sort((a, b) => averageOf(b) - averageOf(a))
  }

  async function handleRate(photo, value) {
    if (!session) return onRequireAuth('rate')
    // Clicking the current rating again clears it
    const next = photo.myRating === value ? 0 : value
    try {
      if (next === 0) await api(`/photos/${photo.id}/rating`, { method: 'DELETE' })
      else await api(`/photos/${photo.id}/rating`, { method: 'PUT', body: { value: next } })
    } catch {
      return // keep the old rating if the save failed
    }
    // Mirror the change locally: swap this user's old vote for the new one
    setPhotos((list) =>
      list.map((p) =>
        p.id === photo.id
          ? {
              ...p,
              myRating: next,
              ratingTotal: p.ratingTotal - p.myRating + next,
              ratingCount: p.ratingCount - (p.myRating > 0 ? 1 : 0) + (next > 0 ? 1 : 0),
            }
          : p,
      ),
    )
  }

  function clearFilters() {
    setCategory('All')
    setSearch('')
    setView('all')
  }

  // Lightbox navigation wraps around the currently visible photos
  const total = visiblePhotos.length
  const closeLightbox = () => setOpenIndex(null)
  // The function form (index => ...) always starts from the latest value, even if a key
  // is pressed again before React has re-rendered
  const showPrev = () => setOpenIndex((index) => (index - 1 + total) % total)
  const showNext = () => setOpenIndex((index) => (index + 1) % total)

  return (
    <section id="gallery" className="px-page py-16">
      <h2 className="section-title">Gallery</h2>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setCategory(name)}
            aria-pressed={category === name}
            className={`cursor-pointer rounded-full border px-4 py-1 text-[.9rem] transition-colors ${
              category === name
                ? 'border-accent bg-accent font-bold text-bg'
                : 'border-border bg-transparent text-text hover:border-accent hover:text-accent'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {session && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {[['all', 'All photos'], ['mine', 'My ratings']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-pressed={view === key}
              className={`cursor-pointer rounded-full border px-4 py-1 text-[.9rem] transition-colors ${
                view === key
                  ? 'border-accent bg-accent font-bold text-bg'
                  : 'border-border bg-transparent text-text hover:border-accent hover:text-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search photos"
          aria-label="Search photos"
          className="field min-w-0 flex-1 sm:max-w-xs"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort photos"
          className="field"
        >
          <option value="default">Sort: Featured</option>
          <option value="title">Title A-Z</option>
          <option value="location">Location A-Z</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>

      <p className="mt-0 mb-6 text-[.9rem] text-muted">
        Showing {total} of {photos.length} photos. ★ Love a shot? Tap the stars to rate it.
      </p>

      {status === 'loading' ? (
        <p className="text-muted">Loading photos…</p>
      ) : status === 'error' ? (
        <p role="alert" className="text-muted">Couldn't load photos. Please try again later.</p>
      ) : total === 0 ? (
        <div className="rounded-md border border-border bg-surface px-4 py-10 text-center">
          <p className="mt-0 mb-4 text-muted">
            {showMine ? "You haven't rated any photos that match yet." : 'No photos match your search.'}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="btn-primary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid auto-rows-[260px] grid-flow-dense grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4">
          {visiblePhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              rating={photo.myRating}
              onRate={(value) => handleRate(photo, value)}
              onOpen={() => setOpenIndex(index)}
            />
          ))}
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          photo={visiblePhotos[openIndex]}
          position={openIndex + 1}
          total={total}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
          onRequireAuth={onRequireAuth}
        />
      )}
    </section>
  )
}

export default Gallery
