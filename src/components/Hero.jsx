function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-[min(85vh,720px)] items-end bg-[linear-gradient(to_top,rgba(20,23,26,.95),rgba(20,23,26,.15)),url(/images/hero-mountains.jpg)] bg-cover bg-center bg-no-repeat px-page py-12"
    >
      <div className="max-w-160">
        <p className="mb-3 inline-block rounded-full border border-accent/40 bg-bg/55 px-3 py-1 text-[.85rem] font-bold tracking-[.15em] text-accent uppercase backdrop-blur-xs">
          Nature photography
        </p>
        <h1 className="mt-0 mb-4 font-heading text-[clamp(2.25rem,7vw,4.5rem)] leading-tight font-normal">
          Light on the wild places
        </h1>
        <p className="mb-6 text-[1.1rem]">
          Mountains, rivers and coastlines, shot at first and last light.
        </p>
        <a
          href="#gallery"
          className="inline-block rounded-md bg-accent px-6 py-3 font-bold text-bg no-underline transition-colors duration-200 hover:bg-accent-dark focus-visible:bg-accent-dark"
        >
          View the gallery
        </a>
      </div>
    </section>
  )
}

export default Hero
