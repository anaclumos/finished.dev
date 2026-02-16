import { requireAuth } from '@server/utils/auth'
import { eq } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { db } from '@/lib/db'
import { userSettings } from '@/lib/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const rows = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1)

  const settings = rows[0]
  if (!settings) {
    return { pushEnabled: true, soundEnabled: true }
  }

  return settings
})
