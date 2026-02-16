import { requireAuth } from '@server/utils/auth'
import { and, eq } from 'drizzle-orm'
import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/schema'

const pushSubscriptionSchema = z.object({
  endpoint: z.string().trim().min(1),
  p256dh: z.string().trim().min(1),
  auth: z.string().trim().min(1),
  userAgent: z.string().trim().optional(),
})

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)

  const { data, success } = pushSubscriptionSchema.safeParse(body)
  if (!success) {
    return {
      success: false,
      message: 'endpoint, p256dh, and auth are required',
    }
  }

  const existing = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, data.endpoint),
        eq(pushSubscriptions.userId, session.user.id)
      )
    )
    .limit(1)

  if (existing[0]) {
    await db
      .update(pushSubscriptions)
      .set({
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent ?? null,
      })
      .where(eq(pushSubscriptions.id, existing[0].id))
  } else {
    await db.insert(pushSubscriptions).values({
      userId: session.user.id,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userAgent: data.userAgent ?? null,
    })
  }

  return { success: true }
})
