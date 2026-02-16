import { requireAuth } from '@server/utils/auth'
import { and, eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody<{
    endpoint?: unknown
    p256dh?: unknown
    auth?: unknown
    userAgent?: unknown
  }>(event)

  if (
    !body ||
    typeof body.endpoint !== 'string' ||
    body.endpoint.trim().length === 0 ||
    typeof body.p256dh !== 'string' ||
    body.p256dh.trim().length === 0 ||
    typeof body.auth !== 'string' ||
    body.auth.trim().length === 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'endpoint, p256dh, and auth are required',
    })
  }

  const endpoint = body.endpoint.trim()
  const p256dh = body.p256dh.trim()
  const auth = body.auth.trim()
  const userAgent =
    typeof body.userAgent === 'string' && body.userAgent.trim().length > 0
      ? body.userAgent.trim()
      : null

  const existing = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.userId, session.user.id)
      )
    )
    .limit(1)

  if (existing[0]) {
    await db
      .update(pushSubscriptions)
      .set({ p256dh, auth, userAgent })
      .where(eq(pushSubscriptions.id, existing[0].id))
  } else {
    await db.insert(pushSubscriptions).values({
      userId: session.user.id,
      endpoint,
      p256dh,
      auth,
      userAgent,
    })
  }

  return { success: true }
})
