import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Admin } from '@/components/admin'
import { Nav, SmoothScroll, SupportChat } from '@/components/site'
import { useLang, useT } from '@/lib/lang'
import { getSiteData } from '@/lib/site-data'
import { SiteProvider } from '@/lib/site-state'
import { PERSON } from '@/lib/seo'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  // Read once a visit. After that the page keeps what the admin changes.
  loader: () => getSiteData(),
  staleTime: Infinity,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#9FC4E8' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Instrument+Sans:wght@400;500;600&family=Rubik:wght@400;500;600;800&display=swap' },
      { rel: 'stylesheet', href: appCss },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify(PERSON) },
      // Counts visits for the Guy Avnaim plaza, with no cookies and nothing kept about a visitor.
      { src: 'https://plazas.page/_plazas/count.js', async: true, 'data-site': 'w-b84356a749' },
    ],
  }),
  component: Root,
})

function Skip() {
  const t = useT()
  return <a className="skip" href="#main">{t('Skip to content')}</a>
}

function Root() {
  const lang = useLang()
  const site = Route.useLoaderData()
  return (
    <html lang={lang} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <head>
        <HeadContent />
      </head>
      <body>
        <SiteProvider initial={site}>
          <Skip />
          <Nav />
          <Outlet />
          <SupportChat />
          <SmoothScroll />
          <Admin />
        </SiteProvider>
        <Scripts />
      </body>
    </html>
  )
}
