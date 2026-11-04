import { createFileRoute, redirect } from '@tanstack/react-router'

// Old address from the previous site.
export const Route = createFileRoute('/production')({
  beforeLoad: () => {
    throw redirect({ to: '/', statusCode: 301 })
  },
})
