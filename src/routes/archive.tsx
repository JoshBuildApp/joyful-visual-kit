import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Contact } from '@/components/site'
import { seo } from '@/lib/seo'
import manifest from '@/data/gallery.json'
import projectsData from '@/data/projects.json'

type Item = { sourceKey: string; kind: string; subject: string | null; name: string; displayUrl: string; previewUrl?: string; posterUrl?: string }

// Not shown until decided: Agilina's material is the company's brand.
const HIDDEN = new Set(['agilina'])
// Fictional brands and spec work, labelled as concepts wherever they appear.
const CONCEPT = new Set(['adidas-originals', 'lunar', 'forgeline', 'talentbridge', 'volea', 'nordhavn', 'solstice', 'aura', 'ember-oak', 'volt-runner', 'noir-vertige'])
const isCirclo = (s: string | null) => !!s && (s.startsWith('circlo') || s === 'coach-of-the-gods')

const items = (manifest as Item[]).filter((i) => i.kind !== 'audio' && !HIDDEN.has(i.subject ?? ''))
const projects = (projectsData as { slug: string; label: string }[]).filter((p) => !HIDDEN.has(p.slug) && items.some((i) => i.subject === p.slug))

export const Route = createFileRoute('/archive')({
  validateSearch: (s: Record<string, unknown>): { p?: string } => (typeof s.p === 'string' ? { p: s.p } : {}),
  head: () => seo('/archive', 'Archive, Guy Avnaim', 'Stills and films from my projects, plus concept work for fictional brands.'),
  component: Archive,
})

const thumb = (i: Item) => (i.kind === 'video' ? i.posterUrl ?? i.previewUrl ?? '' : i.previewUrl ?? i.displayUrl)

function Archive() {
  const { p } = Route.useSearch()
  const nav = Route.useNavigate()
  const [open, setOpen] = useState<number | null>(null)
  const filter = p ?? 'all'
  const shown = useMemo(
    () => items.filter((i) => filter === 'all' || (filter === 'circlo' ? isCirclo(i.subject) : filter === 'concept' ? CONCEPT.has(i.subject ?? '') : i.subject === filter)),
    [filter],
  )
  const pills = [
    { slug: 'all', label: 'All' },
    { slug: 'circlo', label: 'Circlo' },
    { slug: 'concept', label: 'Concept work' },
    ...projects.filter((x) => !isCirclo(x.slug) && !CONCEPT.has(x.slug)).map((x) => ({ slug: x.slug, label: x.label })),
  ]
  const current = open != null ? shown[open] : null
  // Full-size images only, so they arrive in small batches as you scroll.
  const [limit, setLimit] = useState(24)
  const more = useRef<HTMLDivElement>(null)
  useEffect(() => setLimit(24), [filter])
  useEffect(() => {
    const el = more.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setLimit((n) => n + 24)
    }, { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
  }, [filter, limit >= shown.length])
  useEffect(() => {
    if (open == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((o) => (o! + 1) % shown.length)
      if (e.key === 'ArrowLeft') setOpen((o) => (o! - 1 + shown.length) % shown.length)
    }
    addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, shown.length])

  return (
    <main id="main">
      <div className="page">
        <h1>Archive</h1>
        <p className="sub">Stills and films from my projects. <span>Pieces marked Concept are for fictional brands or on spec.</span></p>
        <div className="filters" role="group" aria-label="Filter by project">
          {pills.map((x) => (
            <button key={x.slug} type="button" aria-pressed={filter === x.slug} onClick={() => { setOpen(null); nav({ search: (x.slug === "all" ? {} : { p: x.slug }) as { p?: string } }) }}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="sheet">
          {shown.slice(0, limit).map((i, k) => (
            <button key={i.sourceKey} type="button" onClick={() => setOpen(k)} aria-label={`Open ${i.name}${i.kind === 'video' ? ', video' : ''}`}>
              <img src={thumb(i)} alt="" loading={k < 12 ? "eager" : "lazy"} decoding="async" />
              {CONCEPT.has(i.subject ?? '') && <span className="tag">Concept</span>}
              {i.kind === 'video' && !CONCEPT.has(i.subject ?? '') && <span className="tag">Film</span>}
            </button>
          ))}
        </div>
        {limit < shown.length && <div ref={more} style={{ height: 1 }} aria-hidden="true" />}
      </div>
      {current && (
        <div className="box" role="dialog" aria-modal="true" aria-label={current.name}>
          <div className="boxbar">
            <span>{current.name}{CONCEPT.has(current.subject ?? '') ? ' · Concept' : ''}</span>
            <button type="button" autoFocus onClick={() => setOpen(null)}>Close</button>
          </div>
          <div className="boxmedia">
            {current.kind === 'video' ? (
              <iframe src={`${current.displayUrl}?autoplay=true&muted=true&loop=true`} title={current.name} allow="autoplay; fullscreen" />
            ) : (
              <img src={current.displayUrl} alt={current.name} />
            )}
          </div>
          <div className="boxnav">
            <button type="button" onClick={() => setOpen((o) => (o! - 1 + shown.length) % shown.length)}>Previous</button>
            <button type="button" onClick={() => setOpen((o) => (o! + 1) % shown.length)}>Next</button>
          </div>
        </div>
      )}
      <Contact />
    </main>
  )
}
