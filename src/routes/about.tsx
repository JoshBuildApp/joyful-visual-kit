import { Link, createFileRoute } from '@tanstack/react-router'
import { Contact } from '@/components/site'
import { useLang, useT } from '@/lib/lang'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/about')({
  head: () => seo('/about', 'About, Guy Avnaim', 'Guy Avnaim is a founder in Tel Aviv who designs and builds products with AI as his crew.'),
  component: About,
})

function About() {
  const t = useT()
  const he = useLang() === 'he'
  const circlo = <Link to="/work/$slug" params={{ slug: 'circlo' }}>Circlo</Link>
  const plazas = <Link to="/work/$slug" params={{ slug: 'plazas' }}>Plazas</Link>
  const dogo = <Link to="/work/$slug" params={{ slug: 'dogo' }}>Dogo</Link>
  const dira = <Link to="/work/$slug" params={{ slug: 'dira' }}>Dira</Link>
  const lantern = <Link to="/work/$slug" params={{ slug: 'lantern' }}>Lantern</Link>
  const samuels = <Link to="/work/$slug" params={{ slug: 'samuels' }}>Samuels</Link>
  return (
    <main id="main">
      <div className="page">
        <h1>{t('I’m')} <em>{t('Guy.')}</em></h1>
        <p className="sub">{t('A founder in Tel Aviv.')} <span>{t('I design and build products, with AI as my crew.')}</span></p>
        <div className="prose">
          <p>{t('I take an idea from a blank page to something people can open on their phone. That covers product, design, code and brand, and running the business behind it.')}</p>
          {he ? (
            <p>כרגע זה אומר {circlo}, אפליקציית ספורט ושוק מאמנים, ו-{plazas}, שבה בונים את העסק כמקום ומגייסים אליו עובדי AI. {dogo}, {dira} ו-{lantern} חדשים יותר. {samuels} הוא מותג התכשיטים שהקמתי עם אבא שלי.</p>
          ) : (
            <p>Right now that means {circlo}, a sports app and coach marketplace, and {plazas}, where you build your business as a place and hire AI employees into it. {dogo}, {dira} and {lantern} are newer. {samuels} is the jewelry brand I started with my father.</p>
          )}
          <h2>{t('How I work')}</h2>
          <p>{t('I treat AI as a real team. I set the direction, make the decisions and check the result, and agents do much of the typing. That is why one person can ship this much, and most of the commits on these projects are written with them.')}</p>
          <p>{t('The tools change often. Today that mostly means Claude Code for building, Supabase and Cloudflare underneath, and Higgsfield for images and video.')}</p>
        </div>
      </div>
      <Contact />
    </main>
  )
}
