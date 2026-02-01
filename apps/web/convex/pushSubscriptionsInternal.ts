import { v } from 'convex/values'
import { internalQuery } from './_generated/server'

/**
 * List push subscriptions for a user (internal only).
 */
export const listByUserId = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()
  },
})
