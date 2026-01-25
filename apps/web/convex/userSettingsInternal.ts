import { v } from 'convex/values'
import { internalQuery } from './_generated/server'

/**
 * Get user settings by userId (internal only)
 */
export const get = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userSettings')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()
  },
})
