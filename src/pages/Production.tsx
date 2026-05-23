import { Hero } from '@/components/Hero'
import { Portfolio } from '@/components/Portfolio'
import { About } from '@/components/About'
import { Services } from '@/components/Services'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'

export default function Production() {
  return (
    // overflow-x: hidden prevents any wide child (carousel indicators,
    // hero crossfade scale-110, etc.) from causing a horizontal scrollbar
    // on mobile.
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="relative overflow-x-hidden" role="main">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <section id="portfolio" aria-label="Portfolio section">
          <Portfolio />
        </section>
        <section id="about" aria-label="About section">
          <About />
        </section>
        <section id="services" aria-label="Services section">
          <Services />
        </section>
        <section id="contact" aria-label="Contact section">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  )
}
