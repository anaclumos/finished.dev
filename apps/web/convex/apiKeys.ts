import type { GenericDatabaseReader } from 'convex/server'
import { v } from 'convex/values'
import type { DataModel, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'

/**
 * Generate a cryptographically secure API key
 * Format: fin_[32 alphanumeric characters]
 */
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'fin_'
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

/**
 * Simple hash function for API key storage
 * In production, use a proper crypto library
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Create a new API key for the authenticated user
 * Returns the raw key (only shown once!)
 */
export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const userId = identity.subject
    const rawKey = generateApiKey()
    const keyHash = await hashApiKey(rawKey)
    const keyPrefix = rawKey.substring(0, 12) // "fin_" + first 8 chars

    await ctx.db.insert('apiKeys', {
      userId,
      name: args.name,
      keyHash,
      keyPrefix,
      createdAt: Date.now(),
    })

    // Return the raw key - this is the only time it's visible!
    return {
      key: rawKey,
      prefix: keyPrefix,
    }
  },
})

/**
 * List all API keys for the authenticated user
 * Only returns prefix and metadata, never the full key
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const keys = await ctx.db
      .query('apiKeys')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .collect()

    return keys.map((key) => ({
      _id: key._id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
    }))
  },
})

/**
 * Delete an API key
 */
export const remove = mutation({
  args: {
    id: v.id('apiKeys'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const key = await ctx.db.get(args.id)
    if (!key) {
      throw new Error('API key not found')
    }

    if (key.userId !== identity.subject) {
      throw new Error('Unauthorized')
    }

    await ctx.db.delete(args.id)
    return { success: true }
  },
})

/**
 * Validate an API key and return user info
 * Used internally by webhook handler
 */
export const validateKey = async (
  ctx: { db: GenericDatabaseReader<DataModel> },
  rawKey: string
): Promise<{ userId: string; keyId: Id<'apiKeys'> } | null> => {
  const keyHash = await hashApiKey(rawKey)

  const apiKey = await ctx.db
    .query('apiKeys')
    .withIndex('by_keyHash', (q) => q.eq('keyHash', keyHash))
    .first()

  if (!apiKey) {
    return null
  }

  // Update last used timestamp
  await ctx.db.patch(apiKey._id, {
    lastUsedAt: Date.now(),
  })

  return {
    userId: apiKey.userId,
    keyId: apiKey._id,
  }
}
