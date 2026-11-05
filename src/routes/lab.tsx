import { createFileRoute } from '@tanstack/react-router'
import { Arrow, Contact } from '@/components/site'
import { LAB } from '@/content/projects'
import { useT } from '@/lib/lang'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/lab')({
  head: () => seo('/lab', 'Lab, Guy Avnaim', 'Smaller experiments and prototypes, with their honest status.'),
  component: Lab,
})

function Lab() {
  const t = useT()
  return (
    <main id="main">
      <div className="page">
        <h1>{t('Lab')}</h1>
        <p className="sub">{t('Smaller experiments.')} <span>{t('Some are paused, and each one says so.')}</span></p>
        <ul className="rows">
          {LAB.map((x) => (
            <li key={x.name}>
              <b>{x.name}</b>
              <p>
                {t(x.what)}{' '}
                {x.href && <a href={x.href} target="_blank" rel="noopener" aria-label={`Open ${x.name}`}>{t('Open')} <span style={{ display: 'inline-block', width: 12 }}><Arrow out /></span></a>}
              </p>
              <small>{t(x.status)}</small>
            </li>
          ))}
        </ul>
      </div>
      <Contact />
    </main>
  )
}
