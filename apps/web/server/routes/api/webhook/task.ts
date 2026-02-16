import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import { ulid } from 'ulid'
import webpush from 'web-push'
import { db } from '@/lib/db'
import {
  agentTasks,
  apiKeys,
  pushSubscriptions,
  userSettings,
} from '@/lib/schema'

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function getBearerApiKey(authHeader: string | undefined): string {
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing Authorization header',
    })
  }

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token || !token.startsWith('fin_')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid API key format',
    })
  }

  return token
}

function normalizeTaskBody(body: {
  title?: unknown
  status?: unknown
  duration?: unknown
  metadata?: unknown
  source?: unknown
  machineId?: unknown
}) {
  if (
    !body ||
    typeof body.title !== 'string' ||
    body.title.trim().length === 0
  ) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }

  if (
    !body ||
    typeof body.status !== 'string' ||
    body.status.trim().length === 0
  ) {
    throw createError({ statusCode: 400, statusMessage: 'status is required' })
  }

  if (
    body.duration !== undefined &&
    (typeof body.duration !== 'number' ||
      !Number.isFinite(body.duration) ||
      body.duration < 0)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'duration must be a non-negative number',
    })
  }

  if (body.source !== undefined && typeof body.source !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'source must be a string',
    })
  }

  if (body.machineId !== undefined && typeof body.machineId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'machineId must be a string',
    })
  }

  return {
    title: body.title.trim(),
    status: body.status.trim(),
    duration: body.duration,
    metadata: body.metadata,
    source: typeof body.source === 'string' ? body.source : null,
    machineId: typeof body.machineId === 'string' ? body.machineId : null,
  }
}

async function sendTaskPushIfEnabled(input: {
  userId: string
  title: string
  status: string
}) {
  const settings = await db
    .select({ pushEnabled: userSettings.pushEnabled })
    .from(userSettings)
    .where(eq(userSettings.userId, input.userId))
    .limit(1)

  const shouldSendPush = settings[0]?.pushEnabled ?? true
  if (!shouldSendPush) {
    return
  }

  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, input.userId))

  if (subscriptions.length === 0) {
    return
  }

  const vapidEmail = process.env.WEB_PUSH_EMAIL
  const vapidPublicKey = process.env.VITE_WEB_PUSH_PUBLIC_KEY
  const vapidPrivateKey = process.env.WEB_PUSH_PRIVATE_KEY
  if (!(vapidEmail && vapidPublicKey && vapidPrivateKey)) {
    return
  }

  const subject = vapidEmail.startsWith('mailto:')
    ? vapidEmail
    : `mailto:${vapidEmail}`

  webpush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey)

  const payload = JSON.stringify({
    title: input.title,
    body: `Task ${input.status}: ${input.title}`,
    url: '/dashboard',
  })

  await Promise.allSettled(
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
}

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const rawApiKey = getBearerApiKey(authHeader)
  const keyHash = await sha256Hex(rawApiKey)

  const keyMatch = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1)

  const apiKey = keyMatch[0]
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid API key' })
  }

  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id))

  const body = await readBody<{
    title?: unknown
    status?: unknown
    duration?: unknown
    metadata?: unknown
    source?: unknown
    machineId?: unknown
  }>(event)
  const taskInput = normalizeTaskBody(body)

  const inserted = await db
    .insert(agentTasks)
    .values({
      id: ulid(),
      userId: apiKey.userId,
      apiKeyId: apiKey.id,
      title: taskInput.title,
      status: taskInput.status,
      duration: taskInput.duration,
      metadata: taskInput.metadata,
      source: taskInput.source,
      machineId: taskInput.machineId,
    })
    .returning({ id: agentTasks.id })

  const taskId = inserted[0]?.id
  if (!taskId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to record task',
    })
  }

  await sendTaskPushIfEnabled({
    userId: apiKey.userId,
    title: taskInput.title,
    status: taskInput.status,
  })

  return { success: true, taskId, message: 'Task recorded' }
})
