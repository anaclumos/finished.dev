import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  pushSubscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_endpoint', ['endpoint']),
  statusUpdates: defineTable({
    status: v.string(),
    message: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.string(),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_createdBy', ['createdBy']),
})
