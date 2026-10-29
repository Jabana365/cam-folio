import { Link } from 'react-router'

function Logo() {
  return (
    <Link to="/#home" className="font-heading text-[1.4rem] text-text no-underline">
      Cam<span className="text-accent">-</span>Folio
    </Link>
  )
}

export default Logo
