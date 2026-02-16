import { requireAuth } from '@server/utils/auth'
import { count, eq } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { db } from '@/lib/db'
import { agentTasks } from '@/lib/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const result = await db
    .select({ count: count() })
    .from(agentTasks)
    .where(eq(agentTasks.userId, session.user.id))

  return { count: Number(result[0]?.count ?? 0) }
})
