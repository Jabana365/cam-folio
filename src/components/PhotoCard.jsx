// Wide and tall photos span extra grid cells from the sm breakpoint up
const sizeClasses = {
  wide: 'sm:col-span-2',
  tall: 'sm:row-span-2',
}

function PhotoCard({ photo }) {
  return (
    <figure
      className={`group relative m-0 overflow-hidden rounded-md bg-surface ${sizeClasses[photo.size] ?? ''}`}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        className="block h-full w-full object-cover transition-transform duration-400 ease-in-out group-hover:scale-105"
      />
      <figcaption className="pointer-events-none absolute right-2 bottom-2 left-2 flex flex-col gap-0.5 rounded-md border border-white/15 bg-bg/30 px-3 py-2 text-[.85rem] leading-snug backdrop-blur-xs [text-shadow:0_1px_3px_rgba(0,0,0,.8)]">
        <span className="font-heading text-[1.1rem]">{photo.title}</span>
        <div className="flex flex-wrap items-center justify-between gap-x-2">
          <span className="text-[.7rem] tracking-[.15em] text-accent uppercase">
            {photo.location}
          </span>
        </div>
        <span>{photo.description}</span>
      </figcaption>
    </figure>
  )
}

export default PhotoCard
