import { createFileRoute, notFound } from '@tanstack/react-router'
import { Suspense, lazy, useEffect, useState } from 'react'

// The gallery curation tool. It exists only on the dev server, where scripts/gallery-admin-plugin.mjs backs it.
const Gallery = lazy(() => import('@/curate/Gallery'))

export const Route = createFileRoute('/archive_/curate')({
  loader: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: Curate,
})

function Curate() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  return ready ? (
    <Suspense fallback={null}>
      <Gallery />
    </Suspense>
  ) : null
}
