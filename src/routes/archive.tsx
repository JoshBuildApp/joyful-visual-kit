import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AgentsRoom, Doors, Rail, SitesRoom, SystemsRoom, animate } from '@/components/archive-rooms'
import { UploadPieces } from '@/components/archive-upload'
import { Contact } from '@/components/site'
import { COLLECTIONS, collectionOf } from '@/content/archive'
import { useT } from '@/lib/lang'
import { saveHidden } from '@/lib/site-data'
import { useSite } from '@/lib/site-state'
import { seo } from '@/lib/seo'
import manifest from '@/data/gallery.json'
import extra from '@/data/gallery-extra.json'
import sizes from '@/data/gallery-sizes.json'
import projectsData from '@/data/projects.json'

type Item = { sourceKey: string; kind: string; subject: string | null; name: string; displayUrl: string; previewUrl?: string; posterUrl?: string; w?: number; h?: number }

// Not shown until decided: Agilina's material is the company's brand.
const HIDDEN = new Set(['agilina'])
// Fictional brands and spec work, labelled as concepts wherever they appear.
const CONCEPT = new Set(['adidas-originals', 'lunar', 'forgeline', 'talentbridge', 'volea', 'nordhavn', 'solstice', 'aura', 'ember-oak', 'volt-runner', 'noir-vertige'])
const isCirclo = (s: string | null) => !!s && (s.startsWith('circlo') || s === 'coach-of-the-gods')

const REAL_ESTATE = 'real-estate'
const shipped = ([...(extra as Item[]), ...(manifest as Item[])]).filter((i) => i.kind !== 'audio' && !HIDDEN.has(i.subject ?? ''))
const projects = (projectsData as { slug: string; label: string }[]).filter((p) => !HIDDEN.has(p.slug) && shipped.some((i) => i.subject === p.slug))
// One picture from each kind of work, for the door to this room.
const DOOR_FROM = ['wild', 'tokyo', 'real-estate', 'circlo-campaign', 'valdez-gallery', 'nothing-to-lose']
const doorPictures = DOOR_FROM.map((subject) => shipped.find((i) => i.subject === subject && i.kind === 'image')).filter((i): i is Item => !!i).map((i) => i.previewUrl ?? i.displayUrl)
const SIZES = sizes as unknown as Record<string, [number, number]>
const ratio = (i: Item) => {
  if (i.w && i.h) return i.w / i.h
  const size = SIZES[i.sourceKey]
  return size ? size[0] / size[1] : 4 / 5
}

// Every shoot takes turns, so All does not open on a wall of one of them, and real work comes before concept work.
function mix(list: Item[]) {
  const groups = new Map<string, Item[]>()
  for (const item of list) groups.set(item.subject ?? '', [...(groups.get(item.subject ?? '') ?? []), item])
  const out: Item[] = []
  for (let k = 0; out.length < list.length; k++) for (const group of groups.values()) if (group[k]) out.push(group[k])
  return out
}
const isConcept = (i: Item) => CONCEPT.has(i.subject ?? '')
// Real work takes turns across every project, so no one shoot pushes the rest down. Concept work comes after it.
const arrange = (list: Item[]) => [...mix(list.filter((i) => !isConcept(i))), ...mix(list.filter(isConcept))]
// What the admin moved to the top comes first, the latest on top.
const pinnedFirst = (list: Item[], pins: string[]) => {
  const at = new Map(pins.map((key, i) => [key, i]))
  return [...list.filter((i) => at.has(i.sourceKey)).sort((x, y) => at.get(x.sourceKey)! - at.get(y.sourceKey)!), ...list.filter((i) => !at.has(i.sourceKey))]
}

// Each piece goes under the shortest column. Its size is known before it loads, so nothing moves as it arrives.
function useColumns() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const fit = () => setCount(innerWidth < 560 ? 2 : innerWidth < 1000 ? 3 : innerWidth < 1700 ? 4 : 5)
    fit()
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])
  return count
}

function Tile({ item, first, onOpen, picked }: { item: Item; first: boolean; onOpen: (image: HTMLImageElement | null) => void; picked?: boolean }) {
  const t = useT()
  const [loaded, setLoaded] = useState(false)
  const concept = isConcept(item) || item.subject === REAL_ESTATE
  return (
    <button type="button" data-key={item.sourceKey} onClick={(e) => onOpen(e.currentTarget.querySelector('img'))} className={picked ? 'picked' : undefined} aria-pressed={picked} style={{ aspectRatio: String(ratio(item)) }} aria-label={`${item.name}${item.kind === 'video' ? `, ${t('Film')}` : ''}`}>
      <img
        ref={(el) => {
          if (el?.complete && el.naturalWidth) setLoaded(true)
        }}
        className={loaded ? 'in' : undefined}
        src={thumb(item)}
        alt=""
        loading={first ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      {concept && <span className="tag">{t('Concept')}</span>}
      {item.kind === 'video' && <span className="play" aria-hidden="true" />}
      <span className="cap">{item.name}</span>
    </button>
  )
}

export const Route = createFileRoute('/archive')({
  validateSearch: (s: Record<string, unknown>): { p?: string } => (typeof s.p === 'string' ? { p: s.p } : {}),
  head: () => seo('/archive', 'Archive, Guy Avnaim', 'Sites, AI agents, systems and images I have made, with what each one has actually done.'),
  component: Archive,
})

const shelves = new Set(COLLECTIONS.map((c) => c.slug))
const thumb = (i: Item) => (i.kind === 'video' ? i.posterUrl ?? i.previewUrl ?? '' : i.previewUrl ?? i.displayUrl)

function Archive() {
  const t = useT()
  const { p } = Route.useSearch()
  const nav = Route.useNavigate()
  const [open, setOpen] = useState<number | null>(null)
  const filter = p ?? 'all'
  const { admin, hidden, setHidden, setAdmin, content, updateContent } = useSite()
  const pins = content.pins ?? []
  // What ships, plus what the admin uploaded, under the names and shelves the admin gave them.
  const items = useMemo(
    () => [...((content.pieces ?? []) as Item[]), ...shipped].map((i) => ({ ...i, ...content.edits?.[i.sourceKey] })),
    [content.pieces, content.edits],
  )
  // Admin: pieces being picked, and the pieces already taken off.
  const [picking, setPicking] = useState(false)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [trash, setTrash] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (admin) return
    setPicking(false)
    setTrash(false)
    setPicked(new Set())
  }, [admin])
  const live = useMemo(() => items.filter((i) => hidden.has(i.sourceKey) === (admin && trash)), [items, hidden, admin, trash])
  const shown = useMemo(
    () => pinnedFirst(filter === 'all' ? arrange(live) : arrange(live.filter((i) => (filter === 'circlo' ? isCirclo(i.subject) : shelves.has(filter) ? collectionOf(i.subject) === filter : i.subject === filter))), pins),
    [filter, live, pins],
  )
  const moveToTop = async () => {
    setBusy(true)
    const saved = await updateContent({ pins: [...picked, ...pins.filter((key) => !picked.has(key))] })
    setBusy(false)
    if (!saved) return setAdmin(false)
    setPicked(new Set())
    scrollTo({ top: 0, behavior: 'smooth' })
  }
  const commit = async (next: string[]) => {
    setBusy(true)
    const answer = await saveHidden({ data: { hidden: next } }).catch(() => ({ ok: false }))
    setBusy(false)
    if (!answer.ok) return setAdmin(false)
    setHidden(next)
    setPicked(new Set())
  }
  const shelf = filter === 'circlo' ? 'campaigns' : shelves.has(filter) ? filter : collectionOf(filter)
  const pills = [
    { slug: 'all', label: t('All'), count: live.length },
    ...COLLECTIONS.map((c) => ({ slug: c.slug, label: t(c.label), count: live.filter((i) => collectionOf(i.subject) === c.slug).length })).filter((c) => c.count > 0),
  ]
  // Inside a shelf, its projects. Circlo's campaigns count as one.
  const within = COLLECTIONS.find((c) => c.slug === shelf)?.subjects ?? []
  const subPills = [
    ...(shelf === 'campaigns' ? [{ slug: 'circlo', label: 'Circlo', count: live.filter((i) => isCirclo(i.subject)).length }] : []),
    ...projects.filter((x) => within.includes(x.slug) && !isCirclo(x.slug)).map((x) => ({ slug: x.slug, label: x.label, count: live.filter((i) => i.subject === x.slug).length })),
  ].filter((x) => x.count > 0)
  const choose = (slug: string) => {
    setOpen(null)
    nav({ search: (slug === 'all' ? {} : { p: slug }) as { p?: string }, resetScroll: false })
    // A new set starts from its top, and the filters stay where they are.
    const top = sheet.current!.getBoundingClientRect().top + scrollY - 190
    if (scrollY > top) scrollTo({ top, behavior: 'auto' })
  }
  const current = open != null ? shown[open] : null
  const count = useColumns()
  const columns = useMemo(() => {
    const out: { item: Item; at: number }[][] = Array.from({ length: count }, () => [])
    const heights = out.map(() => 0)
    shown.forEach((item, at) => {
      const k = heights.indexOf(Math.min(...heights))
      out[k]?.push({ item, at })
      heights[k] += 1 / ratio(item)
    })
    return out
  }, [shown, count])
  const sheet = useRef<HTMLDivElement>(null)
  const step = (by: number) => setOpen((o) => (o! + by + shown.length) % shown.length)
  // The next and previous pictures are there before they are asked for.
  useEffect(() => {
    if (open == null) return
    for (const by of [1, -1]) {
      const near = shown[(open + by + shown.length) % shown.length]
      if (near.kind !== 'video') new Image().src = near.displayUrl
    }
  }, [open, shown])
  // The picture grows out of its tile and goes back into it. Only one thing may carry the name at a time.
  const named = useRef<HTMLImageElement | null>(null)
  const carry = (image: HTMLImageElement | null) => {
    if (named.current) named.current.style.viewTransitionName = ''
    if (image) image.style.viewTransitionName = 'piece'
    named.current = image
  }
  const openAt = (at: number, image: HTMLImageElement | null) => {
    carry(image)
    animate(() => {
      setOpen(at)
      carry(null)
    })
  }
  const close = () => {
    const key = open == null ? '' : shown[open]?.sourceKey ?? ''
    const image = document.querySelector<HTMLImageElement>(`[data-key="${CSS.escape(key)}"] img`)
    const box = image?.getBoundingClientRect()
    const moving = animate(() => {
      setOpen(null)
      carry(box && box.bottom > 0 && box.top < innerHeight ? image : null)
    })
    if (moving) void moving.finished.then(() => carry(null), () => carry(null))
    else carry(null)
  }
  // A link to one shelf opens on that shelf, not on the doors.
  useEffect(() => {
    if (p) document.getElementById('images')?.scrollIntoView()
  }, [])
  const swipe = useRef<number | null>(null)
  useEffect(() => {
    if (open == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, shown.length])
  const rename = async (key: string, edit: { name?: string; subject?: string }) => {
    if (!(await updateContent({ edits: { ...content.edits, [key]: { ...content.edits?.[key], ...edit } } }))) setAdmin(false)
  }

  return (
    <main id="main">
      <Doors images={live.length} pictures={doorPictures} />
      <Rail />
      <SitesRoom />
      <AgentsRoom />
      <SystemsRoom />
      <section className="room rImages" id="images">
        <div className="roomHead">
          <h2>{t('Images')}</h2>
          <p>{t('Campaigns, landscapes, spaces and posters I made.')} <span>{t('Pieces marked Concept are for fictional brands or on spec.')}</span></p>
        </div>
        {admin && !trash && <UploadPieces shelf={shelf} />}
        <div className="filters" role="group" aria-label={t('Images')}>
          {pills.map((x) => (
            <button key={x.slug} type="button" aria-pressed={filter === x.slug || shelf === x.slug} onClick={() => choose(x.slug)}>
              {x.label} <small>{x.count}</small>
            </button>
          ))}
        </div>
        {subPills.length > 1 && (
          <div className="subFilters" role="group" aria-label={t('Projects')}>
            {subPills.map((x) => (
              <button key={x.slug} type="button" aria-pressed={filter === x.slug} onClick={() => choose(filter === x.slug ? shelf! : x.slug)}>
                {x.label} <small>{x.count}</small>
              </button>
            ))}
          </div>
        )}
        <div className="sheet" ref={sheet} style={{ '--n': count || 4 } as React.CSSProperties}>
          {columns.map((column, k) => (
            <div key={`${filter}-${k}`}>
              {column.map(({ item, at }) => (
                <Tile
                  key={item.sourceKey}
                  item={item}
                  first={at < count * 3}
                  picked={picking ? picked.has(item.sourceKey) : undefined}
                  onOpen={(image) => {
                    if (!picking) return openAt(at, image)
                    setPicked((now) => {
                      const next = new Set(now)
                      if (!next.delete(item.sourceKey)) next.add(item.sourceKey)
                      return next
                    })
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
      {current && (
        <div
          className="box"
          role="dialog"
          aria-modal="true"
          aria-label={current.name}
          data-lenis-prevent
          onTouchStart={(e) => {
            swipe.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (swipe.current == null) return
            const moved = e.changedTouches[0].clientX - swipe.current
            swipe.current = null
            if (Math.abs(moved) > 50) step(moved < 0 ? 1 : -1)
          }}
        >
          <div className="boxbar">
            <span>{current.name}{isConcept(current) || current.subject === REAL_ESTATE ? ` · ${t('Concept')}` : ''} <small>{open! + 1} / {shown.length}</small></span>
            <button type="button" autoFocus onClick={close}>{t('Close')}</button>
          </div>
          {admin && (
            <div className="adminUi boxEdit">
              <input key={current.sourceKey} aria-label={t('Name')} defaultValue={current.name} maxLength={120} onBlur={(e) => { const name = e.target.value.trim(); if (name && name !== current.name) void rename(current.sourceKey, { name }) }} />
              <select aria-label={t('Shelf')} value={collectionOf(current.subject) ?? ''} onChange={(e) => void rename(current.sourceKey, { subject: e.target.value })}>
                {collectionOf(current.subject) == null && <option value="">{t('No shelf')}</option>}
                {COLLECTIONS.map((c) => <option key={c.slug} value={c.slug}>{t(c.label)}</option>)}
              </select>
            </div>
          )}
          <div className="boxmedia" onClick={(e) => e.target === e.currentTarget && close()}>
            {current.kind === 'video' && current.displayUrl.startsWith('/u/') ? (
              <video key={current.sourceKey} src={current.displayUrl} poster={current.posterUrl} autoPlay muted loop playsInline controls />
            ) : current.kind === 'video' ? (
              <iframe key={current.sourceKey} src={`${current.displayUrl}?autoplay=true&muted=true&loop=true`} title={current.name} allow="autoplay; fullscreen" />
            ) : (
              <img key={current.sourceKey} src={current.displayUrl} alt={current.name} />
            )}
          </div>
          <div className="boxnav">
            <button type="button" onClick={() => step(-1)}>{t('Previous')}</button>
            <button type="button" onClick={() => step(1)}>{t('Next')}</button>
          </div>
        </div>
      )}
      {admin && (
        <div className="adminUi pickBar" role="toolbar" aria-label={t('Archive')}>
          <button type="button" aria-pressed={picking} onClick={() => { setPicking(!picking); setPicked(new Set()) }}>{t(picking ? 'Stop selecting' : 'Select')}</button>
          {picking && !trash && <button type="button" disabled={busy || picked.size === 0} onClick={() => void moveToTop()}>{t('Move to top')} ({picked.size})</button>}
          {picking && (
            <button
              type="button"
              className="main"
              disabled={busy || picked.size === 0}
              onClick={() => void commit(trash ? [...hidden].filter((key) => !picked.has(key)) : [...hidden, ...picked])}
            >
              {t(trash ? 'Restore' : 'Delete')} ({picked.size})
            </button>
          )}
          <button type="button" aria-pressed={trash} onClick={() => { setTrash(!trash); setPicked(new Set()) }}>{trash ? t('Back to the archive') : `${t('Deleted')} (${hidden.size})`}</button>
        </div>
      )}
      <Contact />
    </main>
  )
}
