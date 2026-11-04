import { createRouter as createTanStackRouter, Link } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

function NotFound() {
  return (
    <main className="page">
      <h1>Off the <em>line.</em></h1>
      <p className="sub">This page doesn’t exist.</p>
      <p style={{ marginTop: 24 }}>
        <Link className="pill" style={{ background: 'var(--ink)', color: '#fff' }} to="/">Back to the work</Link>
      </p>
    </main>
  )
}

export function getRouter() {
  return createTanStackRouter({
    routeTree,
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
