import { sha256Hex } from '@server/utils/crypto'
import { sendTaskPushIfEnabled } from '@server/utils/push'
import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import { ulid } from 'ulid'
import { z } from 'zod'
import { db } from '@/lib/db'
import { agentTasks, apiKeys } from '@/lib/schema'

const taskBodySchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  status: z.string().trim().min(1, 'status is required'),
  duration: z.number().finite().nonnegative().optional(),
  metadata: z.unknown().optional(),
  source: z.string().optional(),
  machineId: z.string().optional(),
})

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

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const rawApiKey = getBearerApiKey(authHeader)

  const [keyHash, body] = await Promise.all([
    sha256Hex(rawApiKey),
    readBody(event),
  ])

  const keyMatch = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1)

  const apiKey = keyMatch[0]
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid API key' })
  }

  const parsed = taskBodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid request body',
    })
  }

  const taskInput = parsed.data

  const [inserted] = await Promise.all([
    db
      .insert(agentTasks)
      .values({
        id: ulid(),
        userId: apiKey.userId,
        apiKeyId: apiKey.id,
        title: taskInput.title,
        status: taskInput.status,
        duration: taskInput.duration,
        metadata: taskInput.metadata,
        source: taskInput.source ?? null,
        machineId: taskInput.machineId ?? null,
      })
      .returning({ id: agentTasks.id }),
    db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id)),
  ])

  const taskId = inserted[0]?.id
  if (!taskId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to record task',
    })
  }

  // Fire-and-forget: don't await push notification
  sendTaskPushIfEnabled({
    userId: apiKey.userId,
    title: taskInput.title,
    status: taskInput.status,
  })

  return { success: true, taskId, message: 'Task recorded' }
})
