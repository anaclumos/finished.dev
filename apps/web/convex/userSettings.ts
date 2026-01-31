import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Get user settings, creating defaults if none exist
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .first()

    if (!settings) {
      // Return defaults
      return {
        pushEnabled: true,
        soundEnabled: true,
      }
    }

    return {
      pushEnabled: settings.pushEnabled,
      soundEnabled: settings.soundEnabled,
    }
  },
})

/**
 * Update user settings
 */
export const update = mutation({
  args: {
    pushEnabled: v.optional(v.boolean()),
    soundEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const userId = identity.subject

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.pushEnabled !== undefined && {
          pushEnabled: args.pushEnabled,
        }),
        ...(args.soundEnabled !== undefined && {
          soundEnabled: args.soundEnabled,
        }),
        updatedAt: Date.now(),
      })
      return existing._id
    }

    // Create new settings
    return await ctx.db.insert('userSettings', {
      userId,
      pushEnabled: args.pushEnabled ?? true,
      soundEnabled: args.soundEnabled ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})
