import { v } from 'convex/values'
import { internalMutation, internalQuery } from './_generated/server'

/**
 * Get API key by hash (internal only, for webhook validation)
 */
export const getByHash = internalQuery({
  args: {
    keyHash: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('apiKeys')
      .withIndex('by_keyHash', (q) => q.eq('keyHash', args.keyHash))
      .first()
  },
})

/**
 * Update last used timestamp
 */
export const updateLastUsed = internalMutation({
  args: {
    id: v.id('apiKeys'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastUsedAt: Date.now(),
    })
  },
})
