import { Link, createFileRoute } from '@tanstack/react-router'
import { Contact } from '@/components/site'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/about')({
  head: () => seo('/about', 'About, Guy Avnaim', 'Guy Avnaim is a founder in Tel Aviv who designs and builds products with AI as his crew.'),
  component: About,
})

function About() {
  return (
    <main id="main">
      <div className="page">
        <h1>I’m <em>Guy.</em></h1>
        <p className="sub">A founder in Tel Aviv. <span>I design and build products, with AI as my crew.</span></p>
        <div className="prose">
          <p>I take an idea from a blank page to something people can open on their phone. That covers product, design, code and brand, and running the business behind it.</p>
          <p>Right now that means <Link to="/work/$slug" params={{ slug: 'circlo' }}>Circlo</Link>, a sports app and coach marketplace, and <Link to="/work/$slug" params={{ slug: 'plazas' }}>Plazas</Link>, where you build your business as a place and hire AI employees into it. <Link to="/work/$slug" params={{ slug: 'dogo' }}>Dogo</Link>, <Link to="/work/$slug" params={{ slug: 'dira' }}>Dira</Link> and <Link to="/work/$slug" params={{ slug: 'lantern' }}>Lantern</Link> are newer. <Link to="/work/$slug" params={{ slug: 'samuels' }}>Samuels</Link> is the jewelry brand I started with my father.</p>
          <h2>How I work</h2>
          <p>I treat AI as a real team. I set the direction, make the decisions and check the result, and agents do much of the typing. That is why one person can ship this much, and most of the commits on these projects are written with them.</p>
          <p>The tools change often. Today that mostly means Claude Code for building, Supabase and Cloudflare underneath, and Higgsfield for images and video.</p>
        </div>
      </div>
      <Contact />
    </main>
  )
}
