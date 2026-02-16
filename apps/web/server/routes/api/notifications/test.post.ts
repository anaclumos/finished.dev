import { requireAuth } from '@server/utils/auth'
import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import webpush from 'web-push'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/schema'

function readRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw createError({
      statusCode: 500,
      statusMessage: `${name} is not configured`,
    })
  }
  return value
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody<{
    title?: unknown
    body?: unknown
    url?: unknown
  }>(event)

  if (body?.title !== undefined && typeof body.title !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'title must be a string',
    })
  }

  if (body?.body !== undefined && typeof body.body !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'body must be a string',
    })
  }

  if (body?.url !== undefined && typeof body.url !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'url must be a string',
    })
  }

  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, session.user.id))

  if (subscriptions.length === 0) {
    return { success: true, sent: 0 }
  }

  const vapidEmail = readRequiredEnv('WEB_PUSH_EMAIL')
  const vapidPublicKey = readRequiredEnv('VITE_WEB_PUSH_PUBLIC_KEY')
  const vapidPrivateKey = readRequiredEnv('WEB_PUSH_PRIVATE_KEY')
  const subject = vapidEmail.startsWith('mailto:')
    ? vapidEmail
    : `mailto:${vapidEmail}`

  webpush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey)

  const payload = JSON.stringify({
    title: typeof body?.title === 'string' ? body.title : 'Test notification',
    body:
      typeof body?.body === 'string'
        ? body.body
        : 'This is a test notification from finished.dev',
    url: typeof body?.url === 'string' ? body.url : '/dashboard',
  })

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
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

  const sent = results.filter((result) => result.status === 'fulfilled').length

  return { success: true, sent }
})
