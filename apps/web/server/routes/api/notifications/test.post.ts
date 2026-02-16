import { requireAuth } from '@server/utils/auth'
import {
  ensureVapidConfigured,
  sendPushToSubscriptions,
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

  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, session.user.id))

  if (subscriptions.length === 0) {
    return {
      success: false,
      sent: 0,
      message:
        'No push subscriptions found. Enable notifications in your browser first.',
    }
  }

  const payload = JSON.stringify({
    title: body.title ?? 'Test notification',
    body: body.body ?? 'This is a test notification from finished.dev',
    url: body.url ?? '/dashboard',
  })

  const result = await sendPushToSubscriptions(subscriptions, payload)

  if (result.sent === 0) {
    const staleNote =
      result.staleIds.length > 0
        ? ` ${result.staleIds.length} expired subscription(s) were removed.`
        : ''
    return {
      success: false,
      sent: 0,
      message: `Push delivery failed: ${result.errors[0] ?? 'Unknown error'}.${staleNote} Re-enable notifications to create a fresh subscription.`,
    }
  }

  return { success: true, sent: result.sent }
})
