import { eq } from 'drizzle-orm'
import webpush from 'web-push'
import { db } from '@/lib/db'
import { pushSubscriptions, userSettings } from '@/lib/schema'

let vapidConfigured = false

export function ensureVapidConfigured() {
  if (vapidConfigured) {
    return true
  }

  const vapidSubject = process.env.WEB_PUSH_SUBJECT
  const vapidPublicKey = process.env.VITE_WEB_PUSH_PUBLIC_KEY
  const vapidPrivateKey = process.env.WEB_PUSH_PRIVATE_KEY

  if (!(vapidSubject && vapidPublicKey && vapidPrivateKey)) {
    return false
  }

  const subject = vapidSubject.startsWith('mailto:')
    ? vapidSubject
    : `mailto:${vapidSubject}`

  webpush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey)
  vapidConfigured = true
  return true
}

export interface PushResult {
  success: boolean
  stale?: boolean
  error?: string
}

export async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: string
): Promise<PushResult> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    )
    return { success: true }
  } catch (err) {
    const e = err as { statusCode?: number; body?: string }
    const stale =
      e.statusCode === 410 ||
      e.statusCode === 404 ||
      (e.statusCode === 403 && e.body?.includes('BadJwtToken'))
    return {
      success: false,
      stale,
      error: e.body?.trim() || e.statusCode?.toString() || 'Unknown error',
    }
  }
}

export async function clearPushSubscription(userId: string) {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId))
}

export async function sendTaskPushIfEnabled(input: {
  userId: string
  title: string
  status: string
}) {
  if (!ensureVapidConfigured()) {
    return
  }

  const settingsRows = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, input.userId))
    .limit(1)

  if (!settingsRows[0]?.pushEnabled) {
    return
  }

  const subRows = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, input.userId))
    .limit(1)

  const sub = subRows[0]
  if (!sub) {
    return
  }

  const payload = JSON.stringify({
    title: input.title,
    body: `Task ${input.status}: ${input.title}`,
    url: '/dashboard',
  })

  const result = await sendPush(
    { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
    payload
  )

  if (result.stale) {
    await clearPushSubscription(input.userId)
  }
}
