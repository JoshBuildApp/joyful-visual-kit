import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { AddSite } from '@/components/archive-upload'
import { AGENTS, AGENTS_AS_OF, AGENT_TOTALS, AGENT_WEEKS, MONTHS, OTHER_AGENTS, SITES, SYSTEMS, SYSTEMS_TOTAL } from '@/content/archive'
import type { Agent, SiteWork } from '@/content/archive'
import { useLang, useT } from '@/lib/lang'
import { useSite } from '@/lib/site-state'

export const ROOMS = [
  { id: 'sites', label: 'Sites' },
  { id: 'agents', label: 'Agents' },
  { id: 'systems', label: 'Systems' },
  { id: 'images', label: 'Images' },
]

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

// A change the browser can animate on its own: what moved slides to its new place.
export function animate(change: () => void) {
  if (!document.startViewTransition || document.hidden || matchMedia('(prefers-reduced-motion:reduce)').matches) return change()
  const moving = document.startViewTransition(() => flushSync(change))
  // A transition the browser drops still made the change, so there is nothing to report.
  moving.ready.catch(() => {})
  return moving
}

export function useSites(): SiteWork[] {
  const { content } = useSite()
  return (content.sites as SiteWork[] | undefined) ?? SITES
}

// The four doors. Each one shows what kind of thing is behind it, in that thing's own form.
export function Doors({ images, pictures }: { images: number; pictures: string[] }) {
  const t = useT()
  const sites = useSites()
  return (
    <header className="arcTop">
      <h1>{t('Archive')}</h1>
      <p className="sub">{t('Everything I have made, in four rooms.')}</p>
      <nav className="doors" aria-label={t('Archive')}>
        <a className="door dSites" href="#sites" onClick={(e) => { e.preventDefault(); go('sites') }}>
          <span className="doorArt" aria-hidden="true"><img src="/media/archive/offplan.webp" alt="" /></span>
          <b>{sites.length}</b>
          <span>{t('Sites')}</span>
        </a>
        <a className="door dAgents" href="#agents" onClick={(e) => { e.preventDefault(); go('agents') }}>
          <span className="doorArt" aria-hidden="true">{AGENTS.map((a) => <i key={a.id} style={{ background: a.color }}>{a.name[0]}</i>)}</span>
          <b>{AGENTS.length}</b>
          <span>{t('Agents')}</span>
        </a>
        <a className="door dSystems" href="#systems" onClick={(e) => { e.preventDefault(); go('systems') }}>
          <span className="doorArt" aria-hidden="true">{SYSTEMS.map((s) => <i key={s.id} style={{ background: s.color, marginInlineStart: `${(s.from / MONTHS.length) * 100}%`, width: `${((s.to - s.from + 1) / MONTHS.length) * 100}%` }} />)}</span>
          <b>{SYSTEMS.length}</b>
          <span>{t('Systems')}</span>
        </a>
        <a className="door dImages" href="#images" onClick={(e) => { e.preventDefault(); go('images') }}>
          <span className="doorArt" aria-hidden="true">{pictures.map((src) => <img key={src} src={src} alt="" />)}</span>
          <b>{images}</b>
          <span>{t('Images')}</span>
        </a>
      </nav>
    </header>
  )
}

// Stays in view while the rooms go by, and says which room this is.
export function Rail() {
  const t = useT()
  const [now, setNow] = useState('')
  useEffect(() => {
    // Back up at the doors no room is in the middle of the screen, and the rail goes away.
    const inside = new Set<string>()
    const seen = new IntersectionObserver((list) => {
      for (const one of list) {
        if (one.isIntersecting) inside.add(one.target.id)
        else inside.delete(one.target.id)
      }
      setNow(ROOMS.find((room) => inside.has(room.id))?.id ?? '')
    }, { rootMargin: '-45% 0px -50% 0px' })
    for (const room of ROOMS) {
      const el = document.getElementById(room.id)
      if (el) seen.observe(el)
    }
    return () => seen.disconnect()
  }, [])
  return (
    <div className="roomRail">
      <nav aria-label={t('Archive')} className={now ? 'on' : undefined}>
        {ROOMS.map((room) => (
          <a key={room.id} href={`#${room.id}`} aria-current={now === room.id ? 'true' : undefined} onClick={(e) => { e.preventDefault(); go(room.id) }}>{t(room.label)}</a>
        ))}
      </nav>
    </div>
  )
}

function RoomHead({ title, line, note }: { title: string; line: string; note?: string }) {
  const t = useT()
  return (
    <div className="roomHead">
      <h2>{t(title)}</h2>
      <p>{t(line)}{note && <small>{note}</small>}</p>
    </div>
  )
}

// As the page scrolls, the site scrolls inside its window.
function SiteCard({ site, onRemove }: { site: SiteWork; onRemove?: () => void }) {
  const t = useT()
  return (
    <article className="siteCard rise">
      <a className="frame" href={site.url} target="_blank" rel="noreferrer" aria-label={`${t('Open')} ${site.name}`}>
        <span className="chrome" aria-hidden="true"><i /><i /><i /><span dir="ltr">{site.url.replace(/^https?:\/\//, '')}</span></span>
        <span className="view"><img src={site.shot} width={site.w} height={site.h} loading="lazy" decoding="async" alt="" /></span>
      </a>
      <div className="siteText">
        <h3>{site.name}</h3>
        <small>{t(site.kind)}</small>
        <p>{t(site.what)}</p>
        <div>
          <a href={site.url} target="_blank" rel="noreferrer">{t('Open')} ↗</a>
          {site.slug && <Link to="/work/$slug" params={{ slug: site.slug }}>{t('The story')}</Link>}
          {onRemove && <button type="button" className="adminUi" onClick={onRemove}>{t('Delete')}</button>}
        </div>
      </div>
    </article>
  )
}

export function SitesRoom() {
  const { admin, updateContent, setAdmin } = useSite()
  const sites = useSites()
  const remove = async (id: string) => {
    if (!(await updateContent({ sites: sites.filter((s) => s.id !== id) }))) setAdmin(false)
  }
  return (
    <section className="room rSites" id="sites">
      <RoomHead title="Sites" line="Sites I designed and built. Scroll, and each one scrolls in its window." />
      {admin && <AddSite sites={sites} />}
      <div className="wall">
        {sites.map((site) => <SiteCard key={site.id} site={site} onRemove={admin ? () => void remove(site.id) : undefined} />)}
      </div>
    </section>
  )
}

const SORTS: { id: 'done' | 'plazas' | 'secs'; label: string; order: (a: Agent, b: Agent) => number }[] = [
  { id: 'done', label: 'Most work', order: (a, b) => b.done - a.done },
  { id: 'plazas', label: 'Most plazas', order: (a, b) => b.plazas - a.plazas },
  { id: 'secs', label: 'Fastest', order: (a, b) => a.secs - b.secs },
]

export function AgentsRoom() {
  const t = useT()
  const lang = useLang()
  const [sort, setSort] = useState(SORTS[0])
  const shown = useMemo(() => [...AGENTS].sort(sort.order), [sort])
  const most = Math.max(...AGENTS.map((a) => a.done))
  const peak = Math.max(...AGENT_WEEKS.map((w) => w.done))
  const seconds = (n: number) => (lang === 'he' ? `${n} שנ׳` : `${n}s`)
  return (
    <section className="room rAgents" id="agents">
      <RoomHead title="Agents" line="The AI workers I built for Plazas, and what they have actually done." note={`${t('From the Plazas database,')} ${AGENTS_AS_OF}. ${t('Includes my own plazas and testing.')}`} />
      <div className="agentTop rise">
        <dl className="stats">
          <div><dt>{t('tasks finished')}</dt><dd>{AGENT_TOTALS.tasks}</dd></div>
          <div><dt>{t('plazas they worked in')}</dt><dd>{AGENT_TOTALS.plazas}</dd></div>
          <div><dt>{t('tokens read and written')}</dt><dd>{AGENT_TOTALS.tokens}</dd></div>
          <div><dt>{t('runs on a schedule, with nobody asking')}</dt><dd>{AGENT_TOTALS.scheduled}</dd></div>
        </dl>
        <figure className="weeks">
          <figcaption>{t('Tasks finished, by week')}</figcaption>
          <ol>
            {AGENT_WEEKS.map((w) => (
              <li key={`${w.month}${w.day}`} title={`${w.done}`}>
                <b>{w.done}</b>
                <i style={{ height: `${Math.max(3, (w.done / peak) * 100)}%` }} />
                <span>{w.day} {t(w.month)}</span>
              </li>
            ))}
          </ol>
        </figure>
      </div>
      <div className="sorts" role="group" aria-label={t('Sort')}>
        {SORTS.map((s) => <button key={s.id} type="button" aria-pressed={sort.id === s.id} onClick={() => animate(() => setSort(s))}>{t(s.label)}</button>)}
      </div>
      <table className="roster">
        <thead>
          <tr>
            <th scope="col">{t('Agent')}</th>
            <th scope="col" aria-sort={sort.id === 'done' ? 'descending' : undefined}>{t('Tasks finished')}</th>
            <th scope="col" aria-sort={sort.id === 'plazas' ? 'descending' : undefined}>{t('Plazas')}</th>
            <th scope="col" aria-sort={sort.id === 'secs' ? 'ascending' : undefined}>{t('Average time')}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((a) => (
            <tr key={a.id} style={{ viewTransitionName: `agent-${a.id}` }}>
              <th scope="row">
                <i style={{ background: a.color }} aria-hidden="true">{a.name[0]}</i>
                <span><b>{a.name}</b> <small>{t(a.role)}</small><em>{t(a.use)}</em></span>
              </th>
              <td className="tBar"><span className="bar"><i style={{ width: `${(a.done / most) * 100}%` }} /></span><b>{a.done}</b></td>
              <td data-label={t('Plazas')}>{a.plazas}</td>
              <td data-label={t('Average time')}>{seconds(a.secs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="minor">{t('Outside the plazas')}</h3>
      <div className="others">
        {OTHER_AGENTS.map((a) => {
          const inner = <><small>{t(a.tag)}</small><b>{t(a.name)}</b><span>{t(a.what)}</span></>
          return a.href ? <a key={a.name} className="rise" href={a.href} target="_blank" rel="noreferrer">{inner}</a> : <div key={a.name} className="rise">{inner}</div>
        })}
      </div>
    </section>
  )
}

export function SystemsRoom() {
  const t = useT()
  return (
    <section className="room rSystems" id="systems">
      <RoomHead title="Systems" line="Products and platforms I built, one after another, on one line of time." note={`${SYSTEMS.length} ${t('systems')} · ${SYSTEMS_TOTAL} ${t('commits')} · 2026`} />
      <div className="line" style={{ '--m': MONTHS.length } as React.CSSProperties}>
        <div className="sys head" aria-hidden="true">
          <span />
          <div className="track">{MONTHS.map((m) => <span key={m}>{t(m)}</span>)}</div>
          <span>{t('Commits')}</span>
        </div>
        {SYSTEMS.map((s) => {
          const inner = (
            <>
              <div className="sysText">
                <b>{s.name}</b>
                <small>{t(s.status)}</small>
                <span>{t(s.what)}</span>
                {s.stack && <em>{t(s.stack)}</em>}
              </div>
              <div className="track"><i style={{ gridColumn: `${s.from + 1} / ${s.to + 2}`, background: s.color }} /></div>
              <span className="sysCount">{s.count}{s.count && <small>{t('commits')}</small>}</span>
            </>
          )
          if (s.slug) return <Link key={s.id} className="sys" to="/work/$slug" params={{ slug: s.slug }}>{inner}</Link>
          if (s.href) return <a key={s.id} className="sys" href={s.href} target="_blank" rel="noreferrer">{inner}</a>
          return <div key={s.id} className="sys">{inner}</div>
        })}
      </div>
    </section>
  )
}
