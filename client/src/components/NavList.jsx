import { navLinks } from '../data/navLinks'

// className lets Header and Footer lay the list out differently.
// onLinkClick is optional; the mobile menu uses it to close itself after a tap.
function NavList({ className, onLinkClick }) {
  return (
    <ul className={`m-0 flex list-none p-0 ${className}`}>
      {navLinks.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            onClick={onLinkClick}
            className="text-text no-underline hover:text-accent focus-visible:text-accent"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default NavList
