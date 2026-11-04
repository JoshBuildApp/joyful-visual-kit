import { createFileRoute } from '@tanstack/react-router'
import { Arrow, Contact } from '@/components/site'
import { LAB } from '@/content/projects'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/lab')({
  head: () => seo('/lab', 'Lab, Guy Avnaim', 'Smaller experiments and prototypes, with their honest status.'),
  component: Lab,
})

function Lab() {
  return (
    <main id="main">
      <div className="page">
        <h1>Lab</h1>
        <p className="sub">Smaller experiments. <span>Some are paused, and each one says so.</span></p>
        <ul className="rows">
          {LAB.map((x) => (
            <li key={x.name}>
              <b>{x.name}</b>
              <p>
                {x.what}{' '}
                {x.href && <a href={x.href} target="_blank" rel="noopener" aria-label={`Open ${x.name}`}>Open <span style={{ display: 'inline-block', width: 12 }}><Arrow out /></span></a>}
              </p>
              <small>{x.status}</small>
            </li>
          ))}
        </ul>
      </div>
      <Contact />
    </main>
  )
}
