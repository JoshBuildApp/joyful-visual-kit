import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

export const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function Arrow({ out }: { out?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={out ? 'M4 12L12 4M6 4h6v6' : 'M2 8h12M9 3l5 5-5 5'} />
    </svg>
  )
}

export function Nav() {
  return (
    <nav className="nav" aria-label="Main">
      <Link className="brand" to="/">
        <i aria-hidden="true">G</i>Guy Avnaim
      </Link>
      <div className="links">
        <Link to="/" hash="over">Work</Link>
        <Link to="/archive">Archive</Link>
        <Link to="/lab">Lab</Link>
        <Link to="/about">About</Link>
      </div>
      <a className="pill" href="#end">Let’s talk</a>
    </nav>
  )
}

export function Contact() {
  const [copied, setCopied] = useState(false)
  const mail = 'guyavnaim5@gmail.com'
  return (
    <section id="end" aria-label="Contact">
      <div className="cloud" aria-hidden="true" />
      <h2>Let’s build <em>something.</em></h2>
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
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div id="foot">
        <span>Guy Avnaim, Tel Aviv</span>
        <div>
          <Link to="/lab">Lab</Link>
          <a href="https://instagram.com/guy.avnaim" target="_blank" rel="noopener">Instagram</a>
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
  return (
    <p className="lead">
      {lead[0]} {accent ? <em>{lead[1]}</em> : <span>{lead[1]}</span>}
    </p>
  )
}
