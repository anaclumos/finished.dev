import { mutationGeneric, queryGeneric } from 'convex/server'
import { v } from 'convex/values'

export const createStatusUpdate = mutationGeneric({
  args: {
    status: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const updateId = await ctx.db.insert('statusUpdates', {
      status: args.status,
      message: args.message,
      createdAt: Date.now(),
      createdBy: identity.subject,
    })

    return {
      _id: updateId,
      status: args.status,
      message: args.message,
      createdAt: Date.now(),
      createdBy: identity.subject,
    }
  },
})

export const listStatusUpdates = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const updates = await ctx.db
      .query('statusUpdates')
      .withIndex('by_createdAt')
      .order('desc')
      .take(20)

    return updates
  },
})
