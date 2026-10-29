import Hero from '../components/Hero'
import Gallery from '../components/Gallery'
import About from '../components/About'
import Contact from '../components/Contact'

// The original single-page portfolio, now the "/" route
function Home({ onRequireAuth }) {
  return (
    <>
      <Hero />
      <Gallery onRequireAuth={onRequireAuth} />
      <About />
      <Contact />
    </>
  )
}

export default Home
