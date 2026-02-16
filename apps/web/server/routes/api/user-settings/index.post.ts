import { requireAuth } from '@server/utils/auth'
import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import { db } from '@/lib/db'
import { userSettings } from '@/lib/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody<{
    pushEnabled?: unknown
    soundEnabled?: unknown
  }>(event)

  if (
    body?.pushEnabled !== undefined &&
    typeof body.pushEnabled !== 'boolean'
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'pushEnabled must be a boolean',
    })
  }

  if (
    body?.soundEnabled !== undefined &&
    typeof body.soundEnabled !== 'boolean'
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'soundEnabled must be a boolean',
    })
  }

  const existing = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1)

  const current = existing[0]

  if (current) {
    const updated = await db
      .update(userSettings)
      .set({
        pushEnabled: body?.pushEnabled ?? current.pushEnabled,
        soundEnabled: body?.soundEnabled ?? current.soundEnabled,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.id, current.id))
      .returning()

    return updated[0] ?? current
  }

  const inserted = await db
    .insert(userSettings)
    .values({
      userId: session.user.id,
      pushEnabled: body?.pushEnabled ?? true,
      soundEnabled: body?.soundEnabled ?? true,
      updatedAt: new Date(),
    })
    .returning()

  const created = inserted[0]
  if (!created) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user settings',
    })
  }

  return created
})
