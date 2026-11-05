import { createRouter as createTanStackRouter, Link } from '@tanstack/react-router'
import { isHebrew, useLang, useT } from '@/lib/lang'
import { routeTree } from './routeTree.gen'

function NotFound() {
  const t = useT()
  const lang = useLang()
  return (
    <main className="page">
      <h1>{t('Off the')} {lang === 'en' && <em>line.</em>}</h1>
      <p className="sub">{t('This page doesn’t exist.')}</p>
      <p style={{ marginTop: 24 }}>
        <Link className="pill" style={{ background: 'var(--ink)', color: '#fff' }} to="/">{t('Back to the work')}</Link>
      </p>
    </main>
  )
}

export function getRouter() {
  // One router a request on the server, so one visitor's language never reaches another.
  let he = false
  return createTanStackRouter({
    routeTree,
    // /he/about is the page /about in Hebrew: the prefix comes off coming in, and goes back on going out.
    rewrite: {
      input: ({ url }) => {
        he = isHebrew(url.pathname)
        if (!he) return undefined
        url.pathname = url.pathname.slice(3) || '/'
        return url
      },
      output: ({ url }) => {
        if (!he) return undefined
        url.pathname = url.pathname === '/' ? '/he' : `/he${url.pathname}`
        return url
      },
    },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultNotFoundComponent: NotFound,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
