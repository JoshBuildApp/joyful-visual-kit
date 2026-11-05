import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useLogoTaps } from '@/components/admin'
import { useLang, useOtherLang, useT } from '@/lib/lang'

export const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function Arrow({ out }: { out?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={out ? 'M4 12L12 4M6 4h6v6' : 'M2 8h12M9 3l5 5-5 5'} />
    </svg>
  )
}

// The mark: a G drawn in one line, with the coral node every project on the line has.
export function Mark() {
  return (
    <svg className="mark" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M41.86 13.46A21 21 0 1 0 53 32H36" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="48.55" cy="19.07" r="5.2" fill="var(--coral)" />
    </svg>
  )
}

export function Nav() {
  const t = useT()
  const lang = useLang()
  const other = useOtherLang()
  const tap = useLogoTaps()
  return (
    <nav className="nav" aria-label="Main">
      <Link className="brand" to="/">
        <span onClick={tap}><Mark /></span>{t('Guy Avnaim')}
      </Link>
      <div className="links">
        <Link to="/" hash="over">{t('Work')}</Link>
        <Link to="/archive">{t('Archive')}</Link>
        <Link to="/lab">{t('Lab')}</Link>
        <Link to="/about">{t('About')}</Link>
      </div>
      <div className="navEnd">
        <a className="lang" href={other} hrefLang={lang === 'he' ? 'en' : 'he'} lang={lang === 'he' ? 'en' : 'he'}>{lang === 'he' ? 'English' : 'עברית'}</a>
        <a className="pill" href="#end">{t('Let’s talk')}</a>
      </div>
    </nav>
  )
}

// Both come from the Guy Avnaim plaza on Plazas: bookings land in its front door, and Yael answers the chat.
const PLAZA = 'guy-avnaim'
const CHAT_KEY = 'pa_b8dff76165e64284b2f031fbeb85dd1d'

// A script tag written in JSX never runs, so the line goes in by hand, once the contact section is close.
function BookCall() {
  const t = useT()
  const label = t('Book a 30-minute call')
  const spot = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const at = spot.current
    if (!at) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const line = document.createElement('script')
      line.async = true
      line.src = 'https://plazas.ai/embed.js'
      line.dataset.plaza = PLAZA
      line.dataset.piece = 'booking'
      line.dataset.mode = 'button'
      line.dataset.label = label
      at.appendChild(line)
    }, { rootMargin: '600px' })
    io.observe(at)
    return () => {
      io.disconnect()
      at.replaceChildren()
    }
  }, [label])
  return <div id="book" ref={spot} />
}

// Eases the wheel on a computer. Touch keeps the phone's own scrolling, and reduced motion keeps the browser's.
export function SmoothScroll() {
  useEffect(() => {
    if (reduced()) return
    let lenis: { raf: (t: number) => void; destroy: () => void } | undefined
    let frame = 0
    let gone = false
    void import('lenis').then(({ default: Lenis }) => {
      if (gone) return
      lenis = new Lenis({
        lerp: 0.11,
        // The chat and anything fixed over the page scroll by themselves.
        prevent: (node) => node.classList?.contains('plazasChat') || node.style?.position === 'fixed',
      })
      const tick = (t: number) => {
        lenis?.raf(t)
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    })
    return () => {
      gone = true
      cancelAnimationFrame(frame)
      lenis?.destroy()
    }
  }, [])
  return null
}

// Waits for an idle moment, so the chat never competes with the first paint.
export function SupportChat() {
  useEffect(() => {
    const load = () => {
      addEventListener('plazas-assistant-ready', () => (window as Window & { __plazasAssistant?: { host?: HTMLElement } }).__plazasAssistant?.host?.classList.add('plazasChat'), { once: true })
      const line = document.createElement('script')
      line.async = true
      line.src = 'https://plazas.ai/assistant.js'
      line.dataset.key = CHAT_KEY
      document.body.appendChild(line)
    }
    if (typeof requestIdleCallback === 'undefined') setTimeout(load, 2000)
    else requestIdleCallback(load, { timeout: 4000 })
  }, [])
  return null
}

export function Contact() {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const mail = 'guyavnaim5@gmail.com'
  return (
    <section id="end" aria-label="Contact">
      <div className="cloud" aria-hidden="true" />
      <h2>{t('Let’s build')} <em>{t('something.')}</em></h2>
      <BookCall />
      <div id="mail">
        <a href={`mailto:${mail}`}>{mail}</a>
        <button
          type="button"
          className="pill"
          id="copy"
          onClick={() => {
            navigator.clipboard?.writeText(mail).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 1400)
            })
          }}
        >
          {t(copied ? 'Copied' : 'Copy')}
        </button>
      </div>
      <div id="foot">
        <span>{t('Guy Avnaim, Tel Aviv')}</span>
        <div>
          <Link to="/lab">{t('Lab')}</Link>
          <a href="https://instagram.com/guy.avnaim" target="_blank" rel="noopener">{t('Instagram')}</a>
        </div>
      </div>
    </section>
  )
}

// A muted film that loads and plays only while it is on screen.
export function Film({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v || reduced() || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) v.src = src
          v.play().catch(() => {})
        } else v.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [src])
  return <video ref={ref} poster={poster} muted loop playsInline preload="none" aria-label={label} />
}

export function colorVars(c: { bg: string; fg: string; ac: string; dotfg?: string; chip: string; mbg?: string; nameColor?: string }): CSSProperties {
  return {
    '--bg': c.bg,
    '--fg': c.fg,
    '--ac': c.ac,
    '--chip': c.chip,
    ...(c.dotfg ? { '--dotfg': c.dotfg } : {}),
    ...(c.mbg ? { '--mbg': c.mbg } : {}),
    ...(c.nameColor ? { '--nm': c.nameColor } : {}),
  } as CSSProperties
}

export function Lead({ lead, accent }: { lead: [string, string]; accent?: boolean }): ReactNode {
  const t = useT()
  return (
    <p className="lead">
      {t(lead[0])} {accent ? <em>{t(lead[1])}</em> : <span>{t(lead[1])}</span>}
    </p>
  )
}
