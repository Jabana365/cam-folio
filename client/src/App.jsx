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

  return (
    <>
      <Header onSignIn={() => setAuthOpen(true)} />
      <main>
        <Hero />
        <Gallery onRequireAuth={() => setAuthOpen(true)} />
        <About />
        <Contact />
      </main>
      <Footer />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  )
}

export default App
