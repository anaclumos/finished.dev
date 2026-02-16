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

  await Promise.allSettled(
    subscriptionsResult.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload
      )
    )
  )
}
