import { requireAuth } from '@server/utils/auth'
import { desc, eq } from 'drizzle-orm'
import { defineEventHandler, getQuery } from 'h3'
import { db } from '@/lib/db'
import { agentTasks } from '@/lib/schema'

function parseLimit(limit: string | string[] | undefined): number {
  const first = Array.isArray(limit) ? limit[0] : limit
  const parsed = Number.parseInt(first ?? '', 10)

  if (Number.isNaN(parsed)) {
    return 50
  }

  return Math.min(Math.max(parsed, 1), 100)
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const query = getQuery(event)
  const limit = parseLimit(query.limit)

  const tasks = await db
    .select()
    .from(agentTasks)
    .where(eq(agentTasks.userId, session.user.id))
    .orderBy(desc(agentTasks.createdAt))
    .limit(limit)

  return tasks
})
