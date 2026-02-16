import { requireAuth } from '@server/utils/auth'
import { eq } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { db } from '@/lib/db'
import { apiKeys } from '@/lib/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id))

  return keys
})
