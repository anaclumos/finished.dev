import { requireAuth } from '@server/utils/auth'
import { and, eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody<{ endpoint?: unknown }>(event)

  if (
    !body ||
    typeof body.endpoint !== 'string' ||
    body.endpoint.trim().length === 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'endpoint is required',
    })
  }

  const endpoint = body.endpoint.trim()

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.userId, session.user.id)
      )
    )

  return { success: true }
})
