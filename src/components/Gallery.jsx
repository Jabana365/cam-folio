import { useState } from 'react'
import { photos } from '../data/photos'
import { getCommunityStats } from '../utils/ratings'
import PhotoCard from './PhotoCard'
import Lightbox from './Lightbox'

// "All" plus each category found in the data, in first-seen order
const categories = ['All', ...new Set(photos.map((photo) => photo.category))]

function Gallery() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [openIndex, setOpenIndex] = useState(null) // which visible photo the lightbox shows, or null
  // This user's own ratings, { photoId: 1-5 }. Owned here so they survive filtering.
  // BACKEND: for now they live in browser memory and reset on refresh. Later, load the
  // signed-in user's saved ratings here instead of starting empty.
  const [ratings, setRatings] = useState({})

  // Everything below is derived on every render from the state above, never stored separately.
  // .filter() returns a new array, so sorting it in place never touches the original `photos`.
  const query = search.trim().toLowerCase()
  const visiblePhotos = photos.filter(
    (photo) =>
      (category === 'All' || photo.category === category) &&
      `${photo.title} ${photo.location}`.toLowerCase().includes(query),
  )

  function averageOf(photo) {
    return getCommunityStats(photo, ratings[photo.id] ?? 0).average
  }

  if (sortBy === 'title') {
    visiblePhotos.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy === 'location') {
    visiblePhotos.sort((a, b) => a.location.localeCompare(b.location))
  } else if (sortBy === 'rating') {
    visiblePhotos.sort((a, b) => averageOf(b) - averageOf(a))
  }

  function handleRate(id, value) {
    // Clicking the current rating again clears it
    // BACKEND: also send the vote to the server here.
    setRatings({ ...ratings, [id]: ratings[id] === value ? 0 : value })
  }

  function clearFilters() {
    setCategory('All')
    setSearch('')
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

      {total === 0 ? (
        <div className="rounded-md border border-border bg-surface px-4 py-10 text-center">
          <p className="mt-0 mb-4 text-muted">No photos match your search.</p>
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
              rating={ratings[photo.id] ?? 0}
              onRate={(value) => handleRate(photo.id, value)}
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
        />
      )}
    </section>
  )
}

export default Gallery
