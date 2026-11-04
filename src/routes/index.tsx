import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Arrow, Contact, Film, Lead, colorVars, reduced } from '@/components/site'
import { CLIPS, PROJECTS } from '@/content/projects'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/')({
  head: () => seo('/', 'Guy Avnaim, founder', 'Guy Avnaim designs and builds products with AI as his crew: Circlo, Plazas, Dogo, Dira, Lantern and Samuels.'),
  component: Home,
})

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const ss = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const clipSrc = (i: number) => `/media/${CLIPS[i % CLIPS.length].f}.mp4`

function Hero() {
  const hero = useRef<HTMLElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLDivElement>(null)
  const a = useRef<HTMLVideoElement>(null)
  const b = useRef<HTMLVideoElement>(null)
  const poster = useRef<HTMLImageElement>(null)
  const [clip, setClip] = useState(0)

  // Each background video brings its own sky, and light or dark text to suit it.
  useEffect(() => {
    const c = CLIPS[clip]
    const h = hero.current!
    h.style.setProperty('--t', c.t)
    h.style.setProperty('--b', c.b)
    h.style.setProperty('--hfg', c.fg)
    h.style.setProperty('--co', String(c.co))
  }, [clip])

  useEffect(() => {
    if (reduced()) return
    let front = a.current!
    let back = b.current!
    let index = 0
    let swapping = false
    let timer = 0
    const next = () => {
      if (swapping) return
      swapping = true
      index = (index + 1) % CLIPS.length
      const incoming = back
      const old = front
      incoming.currentTime = 0
      incoming.play().catch(() => {})
      incoming.style.opacity = '1'
      old.style.opacity = '0'
      setClip(index)
      front = incoming
      back = old
      timer = window.setTimeout(() => {
        old.pause()
        old.src = clipSrc(index + 1)
        old.load()
        swapping = false
      }, 1050)
    }
    const onTime = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement
      if (v === front && v.duration && v.duration - v.currentTime < 1.1) next()
    }
    const onErr = (e: Event) => {
      if (e.currentTarget === front) next()
    }
    const videos = [a.current!, b.current!]
    videos.forEach((v) => {
      v.addEventListener('timeupdate', onTime)
      v.addEventListener('error', onErr)
    })
    const first = a.current!
    first.src = clipSrc(0)
    b.current!.src = clipSrc(1)
    const onPlaying = () => {
      first.style.opacity = '1'
      if (poster.current) poster.current.style.opacity = '0'
    }
    first.addEventListener('playing', onPlaying, { once: true })
    first.play().catch(() => {})

    // Pause the films once the hero is out of sight.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) front.play().catch(() => {})
      else videos.forEach((v) => v.pause())
    })
    io.observe(hero.current!)
    return () => {
      clearTimeout(timer)
      io.disconnect()
      videos.forEach((v) => {
        v.removeEventListener('timeupdate', onTime)
        v.removeEventListener('error', onErr)
        v.pause()
      })
    }
  }, [])

  // On scroll the footage rises and fills the screen, as the building does in FIND.
  useEffect(() => {
    let ticking = false
    const update = () => {
      ticking = false
      const h = wrap.current!.offsetHeight - hero.current!.offsetHeight
      const p = clamp(scrollY / (h || 1), 0, 1)
      plate.current!.style.setProperty('--ph', String(0.62 + 0.38 * ss(0, 0.8, p)))
      plate.current!.style.setProperty('--pm', String(0.34 * (1 - ss(0.1, 0.8, p))))
      const t = text.current!
      t.style.opacity = String(1 - ss(0.05, 0.5, p))
      t.style.transform = reduced() ? '' : `translateY(${-p * 24}vh)`
      t.style.pointerEvents = p > 0.4 ? 'none' : ''
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    update()
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div id="heroWrap" ref={wrap}>
      <section id="hero" ref={hero} aria-label="Introduction">
        <div className="cloud" id="c1" aria-hidden="true" />
        <div className="cloud" id="c2" aria-hidden="true" />
        <div id="plate" ref={plate} aria-hidden="true">
          <img src="/media/hero-poster.jpg" alt="" ref={poster} fetchPriority="high" />
          <video ref={a} muted playsInline preload="auto" tabIndex={-1} />
          <video ref={b} muted playsInline preload="auto" tabIndex={-1} />
        </div>
        <div id="htext" ref={text}>
          <h1>Guy Avnaim</h1>
          <p id="tag">Founder. I design and build products. <span>With AI as my crew.</span></p>
          <a className="pill" id="hcta" href="#over">See the work <Arrow /></a>
        </div>
        <div id="clip" aria-hidden="true">{CLIPS[clip].n}</div>
      </section>
    </div>
  )
}

function Home() {
  // Sticky sections need their resting position worked out for jump links.
  useEffect(() => {
    const restY = (id: string) => {
      if (id === 'end') return document.documentElement.scrollHeight
      const cards = Array.from(document.querySelectorAll<HTMLElement>('.card'))
      const wrap = document.getElementById('heroWrap')!
      const el = document.getElementById(id)
      const i = el ? cards.indexOf(el) : -1
      if (i < 0) return null
      let y = wrap.offsetTop + wrap.offsetHeight - 40
      for (let k = 0; k < i; k++) y += cards[k].offsetHeight + parseFloat(getComputedStyle(cards[k]).marginBottom)
      return y
    }
    const go = (id: string, smooth: boolean) => {
      const y = restY(id)
      if (y != null) scrollTo({ top: y, behavior: smooth && !reduced() ? 'smooth' : 'auto' })
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]')
      if (!a || a.pathname !== location.pathname) return
      const id = a.hash.slice(1)
      if (id && restY(id) != null) {
        e.preventDefault()
        go(id, true)
      }
    }
    document.addEventListener('click', onClick)
    if (location.hash) setTimeout(() => go(location.hash.slice(1), false), 60)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <main id="main">
      <Hero />
      <div id="work">
        <section className="card" id="over" aria-label="Overview">
          <div className="wrap">
            <h2>Six projects. <em>One</em> line.</h2>
            <ol id="line">
              {PROJECTS.map((p, i) => (
                <li key={p.slug}>
                  <a href={`#p-${p.slug}`}>
                    <i>{i + 1}</i>
                    <b>{p.name}</b>
                    <small>{p.blurb}</small>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>
        {PROJECTS.map((p, i) => (
          <section key={p.slug} className="card" id={`p-${p.slug}`} style={colorVars(p.colors)}>
            <div className="rail" />
            <div className={p.film?.shape === 'land' && p.slug === 'plazas' ? 'inner w' : 'inner'}>
              <div className="copy">
                <span className="dot" aria-hidden="true">{i + 1}</span>
                <h2>{p.name}</h2>
                <Lead lead={p.lead} accent={p.leadAccent} />
                <ul className="chips">{p.chips.map((c) => <li key={c}>{c}</li>)}</ul>
                <Link className="pill" to="/work/$slug" params={{ slug: p.slug }}>See {p.name} <Arrow /></Link>
              </div>
              {p.film ? (
                <div className={`media ${p.film.shape === 'port' ? 'tall' : p.slug === 'plazas' ? 'wide' : ''}`}>
                  <Film src={p.film.src} poster={p.film.poster} label={p.film.label} />
                </div>
              ) : (
                <div className="media" style={p.still?.fit ? ({ '--fit': p.still.fit } as React.CSSProperties) : undefined}>
                  <img src={p.still!.src} alt={p.still!.alt} loading="lazy" />
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
      <Contact />
    </main>
  )
}
