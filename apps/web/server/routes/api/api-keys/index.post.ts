import { requireAuth } from '@server/utils/auth'
import { sha256Hex } from '@server/utils/crypto'
import { createError, defineEventHandler, readBody } from 'h3'
import { customAlphabet } from 'nanoid'
import { z } from 'zod'
import { db } from '@/lib/db'
import { apiKeys } from '@/lib/schema'

const createKeySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
})

const generateKey = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  32
)

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)

  const parsed = createKeySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid request body',
    })
  }

  const rawKey = `fin_${generateKey()}`
  const keyHash = await sha256Hex(rawKey)
  const keyPrefix = rawKey.substring(0, 12)

  const inserted = await db
    .insert(apiKeys)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      keyHash,
      keyPrefix,
    })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
    })

  const created = inserted[0]
  if (!created) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create API key',
    })
  }

  return {
    id: created.id,
    name: created.name,
    keyPrefix: created.keyPrefix,
    key: rawKey,
  }
})
