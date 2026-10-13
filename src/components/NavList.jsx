import { navLinks } from '../data/navLinks'

// className lets Header lay the list out in a row and Footer in a column
function NavList({ className }) {
  return (
    <ul className={`m-0 flex list-none p-0 ${className}`}>
      {navLinks.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
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
