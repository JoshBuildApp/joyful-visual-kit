import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Arrow, Contact, Film, Lead, colorVars } from '@/components/site'
import { PROJECTS } from '@/content/projects'
import { seo } from '@/lib/seo'
import picks from '@/content/picks.json'

export const Route = createFileRoute('/work/$slug')({
  loader: ({ params }) => {
    if (!PROJECTS.some((p) => p.slug === params.slug)) throw notFound()
  },
  head: ({ params }) => {
    const p = PROJECTS.find((x) => x.slug === params.slug)
    return p ? seo(`/work/${p.slug}`, `${p.name}, by Guy Avnaim`, `${p.lead[0]} ${p.lead[1]}`) : {}
  },
  component: Case,
})

function Case() {
  const { slug } = Route.useParams()
  const i = PROJECTS.findIndex((p) => p.slug === slug)
  const p = PROJECTS[i]
  const next = PROJECTS[(i + 1) % PROJECTS.length]
  const gallery = slug === 'circlo' ? picks.circlo : []
  return (
    <main id="main">
      <article className="case" style={colorVars(p.colors)}>
        <header className="chero">
          <h1>{p.name}</h1>
          <Lead lead={p.lead} accent={p.leadAccent} />
          <ul className="chips">{p.chips.map((c) => <li key={c}>{c}</li>)}</ul>
          {p.links.length > 0 && (
            <div className="cactions">
              {p.links.map((l, k) => (
                <a key={l.href} className={k === 0 ? 'pill main' : 'pill ghost'} href={l.href} target="_blank" rel="noopener">
                  {l.label} <Arrow out />
                </a>
              ))}
            </div>
          )}
        </header>
        <div className="cmedia">
          {p.film ? (
            <div className={`film ${p.film.shape}`}>
              <Film src={p.film.src} poster={p.film.poster} label={p.film.label} />
            </div>
          ) : (
            <div className="film land" style={p.still?.fit === 'contain' ? { background: 'var(--mbg)' } : undefined}>
              <img src={p.still!.src} alt={p.still!.alt} style={p.still?.fit ? { objectFit: p.still.fit } : undefined} />
            </div>
          )}
        </div>
        <div className="cbody">
          <div>
            <h2>What it is</h2>
            {p.body.map((t) => <p key={t}>{t}</p>)}
          </div>
          <dl className="facts">
            {p.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {p.shots && (
          <div className="shots" tabIndex={0} aria-label={`${p.name} screens`} style={{ '--ar': p.slug === 'circlo' ? '560/1112' : '16/9' } as React.CSSProperties}>
            {p.shots.map((s) => <div key={s.src}><img src={s.src} alt={s.alt} loading="lazy" /></div>)}
          </div>
        )}
        {gallery.length > 0 && (
          <>
            <h2 className="shotsTitle">From the {p.name} gallery <Link to="/archive" search={{ p: 'circlo' }}>See all</Link></h2>
            <div className="shots" tabIndex={0} aria-label={`${p.name} gallery`} style={{ '--ar': '4/5' } as React.CSSProperties}>
              {gallery.map((g) => <div key={g.src}><img src={g.src} alt={g.name} loading="lazy" /></div>)}
            </div>
          </>
        )}
      </article>
      <Link className="next" to="/work/$slug" params={{ slug: next.slug }} style={{ '--nbg': next.colors.bg, '--nfg': next.colors.nameColor ?? next.colors.fg } as React.CSSProperties}>
        <span>Next project</span>
        <b>{next.name}</b>
      </Link>
      <Contact />
    </main>
  )
}
