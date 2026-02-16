import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/sign-in/$')({
  beforeLoad: () => {
    throw redirect({ to: '/sign-in' })
  },
  component: () => null,
})
