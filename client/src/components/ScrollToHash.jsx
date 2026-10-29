import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

// Pages are separate routes, so a link like /#gallery has to scroll by hand and a new
// page should start at the top. Back/forward is left to the browser, which restores
// the old scroll position.
function ScrollToHash() {
  const { hash, key } = useLocation()
  const navigationType = useNavigationType()
  useEffect(() => {
    if (navigationType === 'POP') return
    const target = hash && document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [hash, key, navigationType])
  return null
}

export default ScrollToHash
