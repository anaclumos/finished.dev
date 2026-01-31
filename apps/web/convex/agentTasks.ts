import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'

/**
 * Record a completed agent task
 * Called internally after webhook validation
 */
export const record = internalMutation({
  args: {
    userId: v.string(),
    apiKeyId: v.id('apiKeys'),
    title: v.string(),
    status: v.string(),
    duration: v.optional(v.number()),
    metadata: v.optional(v.any()),
    source: v.optional(v.string()),
    machineId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert('agentTasks', {
      userId: args.userId,
      apiKeyId: args.apiKeyId,
      title: args.title,
      status: args.status,
      duration: args.duration,
      metadata: args.metadata,
      source: args.source,
      machineId: args.machineId,
      createdAt: Date.now(),
    })

    return taskId
  },
})

/**
 * List recent agent tasks for the authenticated user
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const limit = args.limit ?? 50

    const tasks = await ctx.db
      .query('agentTasks')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .take(limit)

    return tasks
  },
})

/**
 * Get a single task by ID
 */
export const get = query({
  args: {
    id: v.id('agentTasks'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const task = await ctx.db.get(args.id)
    if (!task) {
      return null
    }

    if (task.userId !== identity.subject) {
      throw new Error('Unauthorized')
    }

    return task
  },
})

/**
 * Get task count for the authenticated user
 */
export const count = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const tasks = await ctx.db
      .query('agentTasks')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .collect()

    return tasks.length
  },
})

/**
 * Get tasks from the last N hours
 */
export const recent = query({
  args: {
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const hours = args.hours ?? 24
    const since = Date.now() - hours * 60 * 60 * 1000

    const tasks = await ctx.db
      .query('agentTasks')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .filter((q) => q.gte(q.field('createdAt'), since))
      .order('desc')
      .collect()

    return tasks
  },
})

/**
 * Delete a task
 */
export const remove = mutation({
  args: {
    id: v.id('agentTasks'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new Error('Task not found')
    }

    if (task.userId !== identity.subject) {
      throw new Error('Unauthorized')
    }

    await ctx.db.delete(args.id)
    return { success: true }
  },
})

/**
 * Clear all tasks for the authenticated user
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const tasks = await ctx.db
      .query('agentTasks')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .collect()

    for (const task of tasks) {
      await ctx.db.delete(task._id)
    }

    return { deleted: tasks.length }
  },
})
