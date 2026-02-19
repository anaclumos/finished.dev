import { requireAuth } from '@server/utils/auth'
import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/schema'

const upsertSchema = z.object({
  endpoint: z.string().trim().min(1),
  p256dh: z.string().trim().min(1),
  auth: z.string().trim().min(1),
})

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)

  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid request body',
    })
  }

  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, session.user.id))
    .limit(1)

  if (existing[0]) {
    const updated = await db
      .update(pushSubscriptions)
      .set({
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.p256dh,
        auth: parsed.data.auth,
        updatedAt: new Date(),
      })
      .where(eq(pushSubscriptions.id, existing[0].id))
      .returning()

    return updated[0]
  }

  const inserted = await db
    .insert(pushSubscriptions)
    .values({
      userId: session.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
    })
    .returning()

  const created = inserted[0]
  if (!created) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save push subscription',
    })
  }

  return created
})
