import { requireAuth } from '@server/utils/auth'
import { and, eq } from 'drizzle-orm'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { db } from '@/lib/db'
import { agentTasks } from '@/lib/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = event.context.params?.id ?? getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' })
  }

  await db
    .delete(agentTasks)
    .where(and(eq(agentTasks.id, id), eq(agentTasks.userId, session.user.id)))

  return { success: true }
})
