function About() {
  return (
    <section
      id="about"
      className="grid items-center gap-8 bg-section-alt px-page py-16 md:grid-cols-2"
    >
      <img
        src="/images/about.jpg"
        alt="The photographer standing on riverside rocks in a misty pine valley"
        loading="lazy"
        className="aspect-4/3 w-full rounded-md object-cover"
      />
      <div>
        <h2 className="section-title">About</h2>
        <p className="max-w-136 text-muted">
          I'm Abdalla K, a nature photographer who hikes for the shot. I chase quiet light in
          remote places and print every image myself.
        </p>
        <p className="max-w-136 text-muted">
          Available for outdoor portraits, adventure shoots, wildlife and hunting-trip
          documentaries, and print commissions.
        </p>
      </div>
    </section>
  )
}

export default About
