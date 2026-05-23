import { Link } from 'react-router-dom'

/**
 * Editorial home page for Guy Avnaim's portfolio.
 * Design intent follows PORTFOLIO_DESIGN_REFERENCE.md — warm paper, hairlines,
 * Fraunces italic emphasis, mono technical labels, single terracotta accent.
 *
 * Each category card links to a sub-page or stub. /production is the AI-video
 * studio page (the imported Lovable template, now rebranded to Guy).
 */
export default function Home() {
  return (
    <div className="min-h-screen home-paper text-[--ink]">
      {/* Paper grain overlay */}
      <div aria-hidden className="home-grain" />

      {/* Fixed editorial header */}
      <header className="home-header">
        <div className="home-header-inner">
          <Link to="/" className="home-brand">
            <span className="home-brand-dot" aria-hidden />
            <span className="home-brand-name">Guy Avnaim</span>
          </Link>
          <nav className="home-nav" aria-label="Primary">
            <a href="#about">About</a>
            <a href="#work">Work</a>
            <a href="#capabilities">Capabilities</a>
            <Link to="/production">Production</Link>
            <Link to="/gallery">Gallery</Link>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="home-section home-hero">
        <div className="home-meta">
          <span>Portfolio — 2026</span>
          <span className="home-meta-right">
            <span>Tel Aviv, IL</span>
            <span className="home-meta-coords">32.08°N · 34.78°E</span>
          </span>
        </div>

        <h1 className="home-title">
          Guy <span className="home-em">Avnaim</span>
          <span className="home-dash"> —</span>
        </h1>

        <div className="home-hero-bottom">
          <p className="home-lede">
            Founder and multi-disciplinary <span className="home-em">producer</span> building
            products, brands, and sound from a one-person studio. Strategy, design, code, and
            creative direction across everything I make.
          </p>
          <div className="home-hero-side">
            <span className="home-availability">
              <span className="home-pulse-dot" aria-hidden />
              Currently available for select projects
            </span>
            <a href="#work" className="home-cta">
              See the work <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="home-section">
        <div className="home-section-head">
          <span className="home-mono">§ 01 · About</span>
          <h2 className="home-section-title">
            A <span className="home-em">one-person</span> studio,
            <br />moving at studio speed.
          </h2>
        </div>

        <div className="home-about-grid">
          <blockquote className="home-quote">
            <span className="home-quote-mark" aria-hidden>“</span>
            The shape of a problem is the most interesting part. Build the answer end-to-end,
            or don&rsquo;t bother building it at all.
          </blockquote>
          <div className="home-about-body">
            <p>
              I&rsquo;m not the idea guy — I&rsquo;m the entire team. Strategy, design, code,
              brand, copy, soundtrack, operations — all from one operator. I take products from
              blank page to shipped, and run the business behind them.
            </p>
            <p>
              Right now I&rsquo;m leading <em>Circlo</em>, a coaching platform; building{' '}
              <em>Dira</em>, an app for managing real-estate holdings; running{' '}
              <em>Automation Master</em>, a template library for operators; producing original
              music; and managing a real padel facility on the side. Earlier, I contributed to
              the website and online shop of a well-known sports brand.
            </p>
            <p>
              The thread connecting all of it is that I treat AI tools as a serious team.
              That&rsquo;s what lets one person ship at the scale of a small studio.
            </p>
          </div>
        </div>
      </section>

      {/* Work — typeset as an index */}
      <section id="work" className="home-section">
        <div className="home-section-head">
          <span className="home-mono">§ 02 · Index of Work</span>
          <h2 className="home-section-title">
            Selected <span className="home-em">work</span>,
            <br />and a few things still in motion.
          </h2>
        </div>

        <ul className="home-index" role="list">
          <IndexRow
            n="01"
            name={<>Circlo</>}
            italic
            role="Coaching platform — product, design, code, brand"
            year="2026 — Live"
            live
            href="https://circloclub.com"
            external
          />
          <IndexRow
            n="02"
            name="Circlo Control"
            role="Analytics and manager tools for Circlo coaches"
            year="2026 — In development"
          />
          <IndexRow
            n="03"
            name={<>Dira</>}
            italic
            role="Real-estate holdings & portfolio app"
            year="2026 — Shipping"
          />
          <IndexRow
            n="04"
            name="Automation Master"
            role="Automation templates for operators & founders"
            year="2024 — Running"
          />
          <IndexRow
            n="05"
            name={
              <>
                Coach of the <span className="home-em">Gods</span>
              </>
            }
            role="Creative direction & AI video — full Reels season"
            year="2026 — Released"
            href="/production"
          />
          <IndexRow
            n="06"
            name="Sports Brand — Web & Shop"
            role="Contributor — frontend & e-commerce build"
            year="2023"
          />
          <IndexRow
            n="07"
            name="Padel Facility"
            role="Day-to-day operations — bookings, members, events"
            year="2024 — Running"
          />
        </ul>
      </section>

      {/* Sound aside */}
      <section className="home-sound">
        <span className="home-mono home-sound-eyebrow">A side practice</span>
        <p className="home-sound-text">
          I also <span className="home-em home-accent">produce music</span> — original
          soundtracks, composition, and mix at a professional level. The same instinct for shape
          and feel runs through every track.
        </p>
        <a href="/production" className="home-sound-link">
          See the production studio <span aria-hidden>↗</span>
        </a>
      </section>

      {/* Experience */}
      <section id="experience" className="home-section">
        <div className="home-section-head">
          <span className="home-mono">§ 03 · Experience</span>
          <h2 className="home-section-title">
            The path,
            <br />
            <span className="home-em">so far</span>.
          </h2>
        </div>

        <ul className="home-experience" role="list">
          <ExpRow
            date="2025 — NOW"
            role="Founder & CEO"
            place="Circlo"
            desc="Leading product, design, engineering, and brand for a coaching platform on React + Supabase. Building Circlo Control as the analytics layer."
            tag="Founder"
          />
          <ExpRow
            date="2025 — NOW"
            role="Founder"
            place="Dira"
            desc="Designing and shipping an end-to-end app for managing real-estate holdings."
            tag="Founder"
          />
          <ExpRow
            date="2024 — NOW"
            role="Creator"
            place="Automation Master"
            desc="A growing library of automation templates for operators and solo founders."
            tag="Library"
          />
          <ExpRow
            date="2024 — NOW"
            role="Operator"
            place="Padel facility"
            desc="Running the day-to-day of a real-world sports facility. Real customers, real money, real edge cases."
            tag="Operations"
          />
          <ExpRow
            date="2024 — NOW"
            role="Producer"
            place="Original soundtracks"
            desc="Composing and producing original music — soundtracks, beats, and ambient — at pro-level production."
            tag="Sound"
          />
          <ExpRow
            date="2025"
            role="Creative Director"
            place="Coach of the Gods"
            desc="Produced a full Reels season treating the 12 Olympians as fitness coaches — end-to-end AI video direction."
            tag="Creative"
          />
          <ExpRow
            date="2023"
            role="Contributor"
            place="Sports brand"
            desc="Helped build the website and online shop for a well-known sports company — frontend, brand polish, and commerce."
            tag="Agency"
          />
        </ul>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="home-section">
        <div className="home-section-head">
          <span className="home-mono">§ 04 · Capabilities</span>
          <h2 className="home-section-title">
            What I <span className="home-em">actually do</span>,
            <br />
            across disciplines.
          </h2>
        </div>

        <div className="home-caps">
          <CapBlock
            title={<>Product &amp; <span className="home-em">Engineering</span></>}
            body="Full-stack development with a frontend-first instinct. I write production code and ship the whole product, not just prototypes."
            stack="React · TypeScript · Vite / Tailwind · shadcn/ui · Framer Motion / Supabase · Postgres · RLS · Stripe"
          />
          <CapBlock
            title={<><span className="home-em">UI / UX</span> Design</>}
            body="Interface design, interaction flows, and design systems. The kind of detail work that turns a competent app into one that actually feels good to use — wireframes through pixel-perfect production."
            stack="Figma · Design tokens / Wireframing · Prototyping / Interaction · Motion / Accessibility · Hebrew RTL"
          />
          <CapBlock
            title={<>Brand &amp; <span className="home-em">Identity</span></>}
            body="Brand systems, visual identity, motion, and copy. The story that wraps the product — shipped from day one, not bolted on later."
            stack="Visual identity · Logos / Typography · Color systems / Brand motion · Voice · Narrative"
          />
          <CapBlock
            title={<>Strategy &amp; <span className="home-em">Founding</span></>}
            body="From problem framing to GTM. Market research, pricing, staging plans, brand positioning — the full founder operating system."
            stack="Market research · Business plans / Pricing · GTM · Positioning / Roadmaps · Operations"
          />
          <CapBlock
            title={<>Music <span className="home-em">Production</span></>}
            body="Professional original soundtrack design, composition, mixing and mastering. Studio-grade output for releases and project scoring."
            stack="Composition · Arrangement / Mixing · Mastering / Sound design · Score"
          />
          <CapBlock
            title={<>AI &amp; <span className="home-em">Automation</span></>}
            body="I architect prompts, chain models, and design serious workflows around AI. Templates and pipelines that compress manual ops into background processes."
            stack="Claude · GPT · Multi-model / Prompt engineering · AI agents / Workflow design · Templates"
          />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="home-section home-contact">
        <p className="home-pre">Until then —</p>
        <h2 className="home-contact-title">
          Let&rsquo;s build
          <br />
          <span className="home-em home-accent">something.</span>
        </h2>
        <a className="home-email" href="mailto:guyavnaim5@gmail.com">
          guyavnaim5@gmail.com
        </a>
        <div className="home-socials">
          <a href="https://instagram.com/guy.avnaim" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <span className="home-socials-soon" aria-label="LinkedIn — coming soon">
            <em>LinkedIn — soon</em>
          </span>
          <a href="mailto:guyavnaim5@gmail.com">Email</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <span>© MMXXVI · Guy Avnaim · Tel Aviv</span>
        <a href="#top">Top ↑</a>
      </footer>
    </div>
  )
}

// ---------- helpers ----------

function IndexRow({
  n,
  name,
  italic,
  role,
  year,
  live,
  href,
  external,
}: {
  n: string
  name: React.ReactNode
  italic?: boolean
  role: string
  year: string
  live?: boolean
  href?: string
  external?: boolean
}) {
  const className = `home-index-row${italic ? ' home-index-italic' : ''}`
  const content = (
    <>
      <span className="home-index-n">{n}</span>
      <span className="home-index-name">{name}</span>
      <span className="home-index-role">{role}</span>
      <span className="home-index-year">
        {live && <span className="home-index-dot" aria-hidden />}
        {year}
      </span>
      <span className="home-index-arrow" aria-hidden>
        ↗
      </span>
    </>
  )
  if (href && external) {
    return (
      <li>
        <a className={className} href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      </li>
    )
  }
  if (href && href.startsWith('/')) {
    return (
      <li>
        <Link className={className} to={href}>
          {content}
        </Link>
      </li>
    )
  }
  return (
    <li>
      <a className={className} href={href ?? '#'}>
        {content}
      </a>
    </li>
  )
}

function ExpRow({
  date,
  role,
  place,
  desc,
  tag,
}: {
  date: string
  role: string
  place: string
  desc: string
  tag: string
}) {
  return (
    <li className="home-exp-row">
      <span className="home-mono home-exp-date">{date}</span>
      <span className="home-exp-role">
        {role}
        <em className="home-exp-place"> · {place}</em>
      </span>
      <span className="home-exp-desc">{desc}</span>
      <span className="home-mono home-exp-tag">[{tag}]</span>
    </li>
  )
}

function CapBlock({
  title,
  body,
  stack,
}: {
  title: React.ReactNode
  body: string
  stack: string
}) {
  return (
    <div className="home-cap">
      <h3 className="home-cap-title">{title}</h3>
      <p className="home-cap-body">{body}</p>
      <p className="home-cap-stack">{stack}</p>
    </div>
  )
}
