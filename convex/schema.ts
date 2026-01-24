import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  agents: defineTable({
    userId: v.id("users"),
    name: v.string(),
    status: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  agentEvents: defineTable({
    agentId: v.id("agents"),
    eventType: v.string(),
    providerEventId: v.string(),
    payload: v.any(),
  })
    .index("by_agent", ["agentId"])
    .index("by_agent_provider_event", ["agentId", "providerEventId"]),

  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
    enabled: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_endpoint", ["userId", "endpoint"]),

  webhookInbox: defineTable({
    provider: v.string(),
    providerEventId: v.string(),
    payload: v.any(),
    status: v.string(),
    processedAt: v.optional(v.number()),
  })
    .index("by_provider", ["provider"])
    .index("by_provider_event", ["provider", "providerEventId"]),

  notificationJobs: defineTable({
    userId: v.optional(v.id("users")),
    sourceInboxId: v.optional(v.id("webhookInbox")),
    channel: v.string(),
    dedupeKey: v.string(),
    payload: v.any(),
    status: v.string(),
    runAt: v.number(),
    attempts: v.number(),
    lastError: v.optional(v.string()),
  })
    .index("by_dedupe_key", ["dedupeKey"])
    .index("by_status", ["status"])
    .index("by_run_at", ["runAt"])
    .index("by_status_run_at", ["status", "runAt"]),
});
