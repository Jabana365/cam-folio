import Logo from './Logo'
import NavList from './NavList'

function Footer() {
  return (
    <footer className="grid gap-8 border-t border-border bg-footer px-page pt-12 pb-6 text-[.9rem] text-muted sm:grid-cols-[2fr_1fr_1fr]">
      <div>
        <Logo />
        <p className="mt-2 max-w-88">
          Nature &amp; documentary photography, available for travel worldwide.
        </p>
      </div>

      <nav aria-label="Footer">
        <h3 className="mt-0 mb-4 text-[.8rem] tracking-[.15em] text-text uppercase">Explore</h3>
        <NavList className="flex-col gap-2" />
      </nav>

      <div>
        <h3 className="mt-0 mb-4 text-[.8rem] tracking-[.15em] text-text uppercase">Contact</h3>
        <address className="flex flex-col gap-2 not-italic">
          <a href="mailto:hello@cam-folio.com" className="text-accent no-underline">
            hello@cam-folio.com
          </a>
          <a href="tel:+15550123456" className="text-accent no-underline">
            +1 (555) 012-3456
          </a>
          <span>Dubai</span>
        </address>
      </div>

      <p className="m-0 border-t border-border pt-4 text-center text-[.8rem] sm:col-span-full">
        © 2026 Abdalla K. All photos are the property of the photographer.
      </p>
    </footer>
  )
}

export default Footer
