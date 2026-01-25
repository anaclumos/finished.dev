import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // ============================================
  // API Keys - For CLI authentication
  // ============================================

  /**
   * API Keys - Used by CLI to authenticate webhook requests
   * Format: fin_[32 alphanumeric characters]
   */
  apiKeys: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(), // User-defined name (e.g., "MacBook Pro", "Work PC")
    keyHash: v.string(), // SHA-256 hash of the API key (never store raw)
    keyPrefix: v.string(), // First 8 chars for identification (fin_xxxx)
    lastUsedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_keyHash', ['keyHash']),

  // ============================================
  // Agent Tasks - Completed task records
  // ============================================

  /**
   * Agent Tasks - Records of completed AI agent tasks
   * Created when CLI sends a webhook on task completion
   */
  agentTasks: defineTable({
    userId: v.string(), // Clerk user ID (resolved from API key)
    apiKeyId: v.id('apiKeys'), // Which API key was used
    title: v.string(), // Task name/description
    status: v.string(), // 'success' | 'failure' | 'cancelled'
    duration: v.optional(v.number()), // Duration in milliseconds
    metadata: v.optional(v.any()), // Additional data from CLI
    source: v.optional(v.string()), // e.g., "claude", "cursor", "custom"
    machineId: v.optional(v.string()), // Identifier for the source machine
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_createdAt', ['userId', 'createdAt'])
    .index('by_apiKeyId', ['apiKeyId']),

  // ============================================
  // Push Subscriptions - Browser push notification endpoints
  // ============================================

  /**
   * Push Subscriptions - Web Push API subscription data
   * Used to send notifications when agent tasks complete
   */
  pushSubscriptions: defineTable({
    userId: v.string(), // Clerk user ID
    endpoint: v.string(), // Push service endpoint URL
    p256dh: v.string(), // Public key for encryption
    auth: v.string(), // Auth secret
    userAgent: v.optional(v.string()), // Browser/device info
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_endpoint', ['endpoint']),

  // ============================================
  // User Settings - Notification preferences
  // ============================================

  /**
   * User Settings - Per-user configuration
   */
  userSettings: defineTable({
    userId: v.string(), // Clerk user ID
    pushEnabled: v.boolean(), // Whether to send push notifications
    soundEnabled: v.boolean(), // Whether notifications should play sound
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_userId', ['userId']),
})
