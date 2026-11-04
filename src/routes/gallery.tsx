import { createFileRoute, redirect } from '@tanstack/react-router'

// Old address from the previous site.
export const Route = createFileRoute('/gallery')({
  beforeLoad: () => {
    throw redirect({ to: '/archive', statusCode: 301 })
  },
})
