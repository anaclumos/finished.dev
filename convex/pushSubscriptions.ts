import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const upsertCurrent = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user_endpoint", (q) =>
        q.eq("userId", user._id).eq("endpoint", args.endpoint),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        p256dh: args.p256dh,
        auth: args.auth,
        userAgent: args.userAgent,
        enabled: true,
      });
      return existing._id;
    }

    return ctx.db.insert("pushSubscriptions", {
      userId: user._id,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      userAgent: args.userAgent,
      enabled: true,
    });
  },
});

export const getByUserAndEndpoint = query({
  args: {
    userId: v.id("users"),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user_endpoint", (q) =>
        q.eq("userId", args.userId).eq("endpoint", args.endpoint),
      )
      .first();
  },
});

export const listEnabledByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return subs.filter((s) => s.enabled);
  },
});

export const upsert = mutation({
  args: {
    userId: v.id("users"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user_endpoint", (q) =>
        q.eq("userId", args.userId).eq("endpoint", args.endpoint),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        p256dh: args.p256dh,
        auth: args.auth,
        userAgent: args.userAgent,
        enabled: true,
      });
      return existing._id;
    }

    return ctx.db.insert("pushSubscriptions", {
      userId: args.userId,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      userAgent: args.userAgent,
      enabled: true,
    });
  },
});

export const disable = mutation({
  args: { id: v.id("pushSubscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { enabled: false });
  },
});
