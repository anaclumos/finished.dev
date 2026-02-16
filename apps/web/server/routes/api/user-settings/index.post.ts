import { requireAuth } from '@server/utils/auth'
import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { db } from '@/lib/db'
import { userSettings } from '@/lib/schema'

const updateSettingsSchema = z.object({
  pushEnabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)

  const parsed = updateSettingsSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid request body',
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
        pushEnabled: parsed.data.pushEnabled ?? current.pushEnabled,
        soundEnabled: parsed.data.soundEnabled ?? current.soundEnabled,
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
      pushEnabled: parsed.data.pushEnabled ?? true,
      soundEnabled: parsed.data.soundEnabled ?? true,
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
