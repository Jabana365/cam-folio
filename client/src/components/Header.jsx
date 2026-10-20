import { useState } from 'react'
import { useSession, signOut } from '../lib/auth-client'
import Logo from './Logo'
import NavList from './NavList'

function Header({ onSignIn }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg/90 px-page py-3 backdrop-blur-sm">
      <Logo />
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-controls="main-nav"
        aria-label="Toggle menu"
        className="cursor-pointer rounded-md border border-border bg-transparent px-3 py-1 text-xl leading-none text-text md:hidden"
      >
        {menuOpen ? '✕' : '☰'}
      </button>
      {/* Phones: hidden until the menu button is pressed. md and up: always visible in a row. */}
      <nav
        id="main-nav"
        aria-label="Main"
        className={`${menuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
          <NavList className="flex-col gap-3 py-2 md:flex-row md:gap-5 md:py-0" onLinkClick={() => setMenuOpen(false)} />
          {session ? (
            <div className="flex items-center gap-3 text-[.9rem]">
              <span className="text-muted">Hi, {session.user.name}</span>
              <button
                type="button"
                onClick={() => signOut()}
                className="cursor-pointer rounded-md border border-border bg-transparent px-3 py-1 text-text hover:border-accent hover:text-accent"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onSignIn()
              }}
              className="cursor-pointer rounded-md border border-border bg-transparent px-3 py-1 text-[.9rem] text-text hover:border-accent hover:text-accent"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
