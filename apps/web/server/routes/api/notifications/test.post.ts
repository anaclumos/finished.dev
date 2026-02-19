import { requireAuth } from '@server/utils/auth'
import {
  clearPushSubscription,
  ensureVapidConfigured,
  sendPush,
} from '@server/utils/push'
import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/schema'

const testNotificationSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  url: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const raw = await readBody(event)

  const parsed = testNotificationSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid request body',
    })
  }

  const body = parsed.data

  if (!ensureVapidConfigured()) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Web Push is not configured. Check WEB_PUSH_SUBJECT, VITE_WEB_PUSH_PUBLIC_KEY, and WEB_PUSH_PRIVATE_KEY env vars.',
    })
  }

  const rows = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, session.user.id))
    .limit(1)

  const sub = rows[0]
  if (!sub) {
    return {
      success: false,
      sent: 0,
      message:
        'No push subscription found. Enable notifications in your browser first.',
    }
  }

  const payload = JSON.stringify({
    title: body.title ?? 'Test notification',
    body: body.body ?? 'This is a test notification from finished.dev',
    url: body.url ?? '/dashboard',
  })

  const result = await sendPush(
    { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
    payload
  )

  if (result.stale) {
    await clearPushSubscription(session.user.id)
    return {
      success: false,
      sent: 0,
      message:
        'Push subscription expired. Re-enable notifications to create a fresh subscription.',
    }
  }

  if (!result.success) {
    return {
      success: false,
      sent: 0,
      message: `Push delivery failed: ${result.error}.`,
    }
  }

  return { success: true, sent: 1 }
})
