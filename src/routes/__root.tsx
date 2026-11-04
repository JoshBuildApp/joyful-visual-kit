import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Nav } from '@/components/site'
import { PERSON } from '@/lib/seo'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
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
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap' },
      { rel: 'stylesheet', href: appCss },
    ],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(PERSON) }],
  }),
  component: Root,
})

function Root() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Nav />
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
