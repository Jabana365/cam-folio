import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'

function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authReason, setAuthReason] = useState(null) // 'rate' | 'comment' | null

  return (
    <>
      <Header onSignIn={() => { setAuthReason(null); setAuthOpen(true) }} />
      <main>
        <Hero />
        <Gallery onRequireAuth={(reason) => { setAuthReason(reason); setAuthOpen(true) }} />
        <About />
        <Contact />
      </main>
      <Footer />
      {authOpen && <AuthModal reason={authReason} onClose={() => setAuthOpen(false)} />}
    </>
  )
}

export default App
