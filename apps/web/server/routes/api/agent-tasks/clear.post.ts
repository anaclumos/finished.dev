import { requireAuth } from '@server/utils/auth'
import { eq } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { db } from '@/lib/db'
import { agentTasks } from '@/lib/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  await db.delete(agentTasks).where(eq(agentTasks.userId, session.user.id))

  return { success: true }
})
