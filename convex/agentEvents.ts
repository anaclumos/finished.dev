import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("agentEvents")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
  },
});

export const insertIfNotExists = mutation({
  args: {
    agentId: v.id("agents"),
    eventType: v.string(),
    providerEventId: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentEvents")
      .withIndex("by_agent_provider_event", (q) =>
        q.eq("agentId", args.agentId).eq("providerEventId", args.providerEventId),
      )
      .first();

    if (existing) {
      return null;
    }

    return ctx.db.insert("agentEvents", {
      agentId: args.agentId,
      eventType: args.eventType,
      providerEventId: args.providerEventId,
      payload: args.payload,
    });
  },
});
