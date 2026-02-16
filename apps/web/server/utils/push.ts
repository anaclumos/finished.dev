import { eq, inArray } from 'drizzle-orm'
import webpush from 'web-push'
import { db } from '@/lib/db'
import type { SelectPushSubscription } from '@/lib/schema'
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

export interface PushSendResult {
  sent: number
  failed: number
  staleIds: string[]
  errors: string[]
}

/**
 * Send a push notification to a list of subscriptions.
 * Automatically removes stale (410/404) subscriptions from the DB.
 */
export async function sendPushToSubscriptions(
  subscriptions: SelectPushSubscription[],
  payload: string
): Promise<PushSendResult> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      )
    )
  )

  const staleIds: string[] = []
  const errors: string[] = []
  let sent = 0

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      sent++
    } else {
      const err = result.reason as { statusCode?: number; body?: string }
      // 404 or 410 = subscription expired or unsubscribed
      if (err.statusCode === 410 || err.statusCode === 404) {
        staleIds.push(subscriptions[i].id)
      }
      errors.push(
        err.body?.trim() || err.statusCode?.toString() || 'Unknown error'
      )
    }
  }

  if (staleIds.length > 0) {
    await db
      .delete(pushSubscriptions)
      .where(inArray(pushSubscriptions.id, staleIds))
  }

  return { sent, failed: results.length - sent, staleIds, errors }
}

export async function sendTaskPushIfEnabled(input: {
  userId: string
  title: string
  status: string
}) {
  if (!ensureVapidConfigured()) {
    return
  }

  const [settingsResult, subscriptionsResult] = await Promise.all([
    db
      .select({ pushEnabled: userSettings.pushEnabled })
      .from(userSettings)
      .where(eq(userSettings.userId, input.userId))
      .limit(1),
    db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, input.userId)),
  ])

  const shouldSendPush = settingsResult[0]?.pushEnabled ?? true
  if (!shouldSendPush || subscriptionsResult.length === 0) {
    return
  }

  const payload = JSON.stringify({
    title: input.title,
    body: `Task ${input.status}: ${input.title}`,
    url: '/dashboard',
  })

  await sendPushToSubscriptions(subscriptionsResult, payload)
}
