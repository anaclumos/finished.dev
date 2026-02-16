import type { H3Event } from 'h3'
import { createError } from 'h3'
import { auth } from '@/lib/auth'

export async function getAuthSession(event: H3Event) {
  const session = await auth.api.getSession({ headers: event.headers })
  return session
}

export async function requireAuth(event: H3Event) {
  const session = await getAuthSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return session
}
