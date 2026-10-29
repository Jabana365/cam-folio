import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import Header from './components/Header'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import ScrollToHash from './components/ScrollToHash'
import Home from './pages/Home'
import PrintPage from './pages/PrintPage'
import OrderPage from './pages/OrderPage'
import OrdersPage from './pages/OrdersPage'

function App() {
  // null while the sign-in popup is closed, otherwise why it opened and what to do after
  // a successful sign-in. reason is 'rate' | 'comment' | 'buy' | null.
  const [auth, setAuth] = useState(null)
  // onSuccess is optional: the Buy button uses it to carry on to checkout after signing in
  const requireAuth = (reason, onSuccess) => setAuth({ reason, onSuccess })

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
      {auth && <AuthModal reason={auth.reason} onSuccess={auth.onSuccess} onClose={() => setAuth(null)} />}
    </>
  )
}

export default App
