import Logo from './Logo'
import NavList from './NavList'

function Header() {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg/90 px-page py-3">
      <Logo />
      <nav aria-label="Main">
        <NavList className="flex-wrap gap-5" />
      </nav>
    </header>
  )
}

export default Header
