import { requireAuth } from '@server/utils/auth'
import { createError, defineEventHandler, readBody } from 'h3'
import { db } from '@/lib/db'
import { apiKeys } from '@/lib/schema'

function randomAlphanumeric(length: number): string {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const random = crypto.getRandomValues(new Uint8Array(length))
  let output = ''

  for (const value of random) {
    output += alphabet[value % alphabet.length]
  }

  return output
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody<{ name?: unknown }>(event)

  if (!body || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  const name = body.name.trim()
  const rawKey = `fin_${randomAlphanumeric(32)}`
  const keyHash = await sha256Hex(rawKey)
  const keyPrefix = rawKey.substring(0, 12)

  const inserted = await db
    .insert(apiKeys)
    .values({
      userId: session.user.id,
      name,
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
