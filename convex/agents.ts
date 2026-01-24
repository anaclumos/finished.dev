import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getById = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const getByUserAndName = query({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("agents")
      .withIndex("by_user_name", (q) =>
        q.eq("userId", args.userId).eq("name", args.name),
      )
      .first();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_user_name", (q) =>
        q.eq("userId", args.userId).eq("name", args.name),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return ctx.db.insert("agents", {
      userId: args.userId,
      name: args.name,
      status: args.status ?? "active",
    });
  },
});
