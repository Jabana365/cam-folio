import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import Header from './components/Header'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import Home from './pages/Home'
import PrintPage from './pages/PrintPage'
import OrderPage from './pages/OrderPage'
import OrdersPage from './pages/OrdersPage'

// Pages are separate routes now, so a link like /#gallery has to scroll by hand,
// and moving to a new page should start at the top.
function ScrollToHash() {
  const { hash, key } = useLocation()
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash, key])
  return null
}

function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authReason, setAuthReason] = useState(null) // 'rate' | 'comment' | 'buy' | null
  const [afterAuth, setAfterAuth] = useState(null) // { run } to call once sign-in succeeds
  // onSuccess is optional: the Buy button uses it to carry on to checkout after signing in
  const requireAuth = (reason, onSuccess) => {
    setAuthReason(reason)
    setAfterAuth(onSuccess ? { run: onSuccess } : null)
    setAuthOpen(true)
  }

  return (
    <>
      <ScrollToHash />
      <Header onSignIn={() => requireAuth(null)} />
      <main>
        <Routes>
          <Route path="/" element={<Home onRequireAuth={requireAuth} />} />
          <Route path="/print/:id" element={<PrintPage onRequireAuth={requireAuth} />} />
          <Route path="/order/:id" element={<OrderPage onRequireAuth={requireAuth} />} />
          <Route path="/orders" element={<OrdersPage onRequireAuth={requireAuth} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {authOpen && <AuthModal reason={authReason} onSuccess={afterAuth?.run} onClose={() => setAuthOpen(false)} />}
    </>
  )
}

export default App
