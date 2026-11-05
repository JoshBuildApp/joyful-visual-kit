import { createFileRoute } from '@tanstack/react-router'
import { serveMedia } from '@/lib/admin.server'

export const Route = createFileRoute('/u/$file')({
  server: {
    handlers: {
      GET: ({ request, params }) => (/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/.test(params.file) ? serveMedia(request, params.file) : new Response('Not found', { status: 404 })),
    },
  },
})
