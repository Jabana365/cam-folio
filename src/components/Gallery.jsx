import { useState } from 'react'
import { photos } from '../data/photos'
import PhotoCard from './PhotoCard'

// "All" plus each category found in the data, in first-seen order
const categories = ['All', ...new Set(photos.map((photo) => photo.category))]

function Gallery() {
  const [category, setCategory] = useState('All')
  // Derived on every render from the state above, never stored separately
  const visiblePhotos =
    category === 'All' ? photos : photos.filter((photo) => photo.category === category)

  return (
    <section id="gallery" className="px-page py-16">
      <h2 className="mt-0 mb-6 font-heading text-[2rem] leading-tight font-normal">Gallery</h2>

      <div className="mb-6 flex flex-wrap items-center gap-2">
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

      <div className="grid auto-rows-[260px] grid-flow-dense grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4">
        {visiblePhotos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>
    </section>
  )
}

export default Gallery
