import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Arrow, Contact, Film, Lead, colorVars, reduced } from '@/components/site'
import { CLIPS, PROJECTS } from '@/content/projects'
import { useT } from '@/lib/lang'
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
const SOUND_KEY = 'hero-sound'
// The melody runs under the whole hero, and each shot's own sound plays over it.
const SCORE_LEVEL = 0.8
const EFFECTS_LEVEL = 0.3
const clipSrc = (i: number) => `/media/${CLIPS[i % CLIPS.length].f}.mp4`

function Hero() {
  const t = useT()
  const hero = useRef<HTMLElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLDivElement>(null)
  const a = useRef<HTMLVideoElement>(null)
  const b = useRef<HTMLVideoElement>(null)
  const score = useRef<HTMLAudioElement>(null)
  const poster = useRef<HTMLImageElement>(null)
  const [clip, setClip] = useState(0)
  // The films start with sound. Browsers often hold sound back until the first press, so the same press also turns it on.
  const [muted, setMuted] = useState(true)
  const wantSound = useRef(true)
  const applySound = (on: boolean) => {
    for (const v of [a.current, b.current]) if (v) v.muted = !on
    const music = score.current
    if (music) {
      music.muted = !on
      if (on) music.play().catch(() => {})
      else music.pause()
    }
    setMuted(!on)
  }
  const toggleSound = () => {
    wantSound.current = !wantSound.current
    try {
      localStorage.setItem(SOUND_KEY, wantSound.current ? 'on' : 'off')
    } catch {
      // Not remembered, and it still works for this visit.
    }
    applySound(wantSound.current)
    if (wantSound.current) [a.current, b.current].find((v) => v && !v.paused)?.play().catch(() => {})
  }

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
    try {
      wantSound.current = localStorage.getItem(SOUND_KEY) !== 'off'
    } catch {
      wantSound.current = true
    }
    const onFirstPress = (e: Event) => {
      removePress()
      if (wantSound.current && !(e.target as Element).closest?.('#sound')) applySound(true)
    }
    const removePress = () => {
      removeEventListener('pointerdown', onFirstPress)
      removeEventListener('keydown', onFirstPress)
    }
    const startMuted = () => {
      first.muted = true
      setMuted(true)
      first.play().catch(() => {})
      if (wantSound.current) {
        addEventListener('pointerdown', onFirstPress)
        addEventListener('keydown', onFirstPress)
      }
    }
    if (wantSound.current) {
      first.muted = false
      b.current!.muted = false
      setMuted(false)
      score.current!.muted = false
      score.current!.play().catch(() => {})
      first.play().catch(() => {
        score.current!.muted = true
        score.current!.pause()
        b.current!.muted = true
        startMuted()
      })
    } else startMuted()

    // Pause the films once the hero is out of sight.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        front.play().catch(() => {})
        if (!score.current!.muted) score.current!.play().catch(() => {})
      } else {
        videos.forEach((v) => v.pause())
        score.current!.pause()
      }
    })
    io.observe(hero.current!)
    return () => {
      removePress()
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
      // The sound leaves with the hero, as the projects come up.
      const volume = 1 - ss(0.15, 0.85, p)
      a.current!.volume = volume * EFFECTS_LEVEL
      b.current!.volume = volume * EFFECTS_LEVEL
      score.current!.volume = volume * SCORE_LEVEL
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
        <audio ref={score} src="/media/hero-score.mp3" loop muted preload="auto" />
        <div className="cloud" id="c1" aria-hidden="true" />
        <div className="cloud" id="c2" aria-hidden="true" />
        <div id="plate" ref={plate} aria-hidden="true">
          <img src="/media/hero-poster.jpg" alt="" ref={poster} fetchPriority="high" />
          <video ref={a} muted playsInline preload="auto" tabIndex={-1} />
          <video ref={b} muted playsInline preload="auto" tabIndex={-1} />
        </div>
        <div id="htext" ref={text}>
          <h1>{t('Guy Avnaim')}</h1>
          <p id="tag">{t('Founder. I design and build products.')} <span>{t('With AI as my crew.')}</span></p>
          <a className="pill" id="hcta" href="#over">{t('See the work')} <Arrow /></a>
        </div>
        <button type="button" id="sound" aria-pressed={!muted} onClick={toggleSound}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
            {muted ? <path d="m16 9 5 6m0-6-5 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />}
          </svg>
          {t(muted ? 'Turn sound on' : 'Mute')}
        </button>
        <div id="clip" aria-hidden="true">{t(CLIPS[clip].n)}</div>
      </section>
    </div>
  )
}

function Home() {
  const t = useT()
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

  // In a short window the overview is taller than the screen, so it rests with its bottom in view, or the last project is never seen.
  useEffect(() => {
    const over = document.getElementById('over')!
    const fit = () => {
      over.style.top = `${Math.min(0, innerHeight - over.offsetHeight)}px`
    }
    fit()
    const watch = new ResizeObserver(fit)
    watch.observe(over)
    addEventListener('resize', fit)
    return () => {
      watch.disconnect()
      removeEventListener('resize', fit)
    }
  }, [])

  // A card sinks back as the next one covers it, and the line at the side says which project is up.
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.card'))
    const end = document.getElementById('end')!
    const dots = Array.from(document.querySelectorAll<HTMLElement>('#pos a'))
    const line = document.getElementById('pos')!
    const still = reduced()
    let ticking = false
    const update = () => {
      ticking = false
      const vh = innerHeight
      let up = -1
      cards.forEach((card, i) => {
        if (!still) {
          const next = cards[i + 1] ?? end
          const cover = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh))
          if (card.dataset.cover !== cover.toFixed(3)) {
            card.dataset.cover = cover.toFixed(3)
            card.style.setProperty('--cover', cover.toFixed(3))
          }
        }
        if (card.getBoundingClientRect().top < vh * 0.5) up = i
      })
      // A card two behind is not drawn at all, or the browser runs out of layers a few cards in. The one just behind stays, for the corners.
      if (!still) cards.forEach((card, i) => {
        const above = cards[i + 2]
        card.style.visibility = above && above.getBoundingClientRect().top <= 0 ? 'hidden' : ''
      })
      // The first card is the overview, so a project's dot is one behind its card.
      dots.forEach((dot, i) => dot.toggleAttribute('data-on', i === up - 1))
      line.toggleAttribute('data-up', up >= 1 && end.getBoundingClientRect().top > vh * 0.5)
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <main id="main">
      <Hero />
      <nav id="pos" aria-label={t('Projects')}>
        {PROJECTS.map((p) => (
          <a key={p.slug} href={`#p-${p.slug}`} aria-label={p.name}><span>{p.name}</span></a>
        ))}
      </nav>
      <div id="work">
        <section className="card" id="over" aria-label="Overview">
          <div className="wrap">
            <h2>{t('Seven projects.')} <em>{t('One')}</em> {t('line.')}</h2>
            <ol id="line">
              {PROJECTS.map((p, i) => (
                <li key={p.slug}>
                  <a href={`#p-${p.slug}`}>
                    <i>{i + 1}</i>
                    <b>{p.name}</b>
                    <small>{t(p.blurb)}</small>
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
                <ul className="chips">{p.chips.map((c) => <li key={c}>{t(c)}</li>)}</ul>
                <Link className="pill" to="/work/$slug" params={{ slug: p.slug }}>{t('See')} {p.name} <Arrow /></Link>
              </div>
              {p.film ? (
                <div className={`media ${p.film.shape === 'port' ? 'tall' : p.slug === 'plazas' ? 'wide' : ''}`}>
                  <Film src={p.film.src} poster={p.film.poster} label={t(p.film.label)} />
                </div>
              ) : (
                <div className="media" style={p.still?.fit ? ({ '--fit': p.still.fit } as React.CSSProperties) : undefined}>
                  <img src={p.still!.src} alt={t(p.still!.alt)} loading="lazy" />
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
