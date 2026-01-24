import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const insertIfNotExists = mutation({
  args: {
    provider: v.string(),
    providerEventId: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("webhookInbox")
      .withIndex("by_provider_event", (q) =>
        q.eq("provider", args.provider).eq("providerEventId", args.providerEventId),
      )
      .first();

    if (existing) {
      return null;
    }

    return ctx.db.insert("webhookInbox", {
      provider: args.provider,
      providerEventId: args.providerEventId,
      payload: args.payload,
      status: "pending",
    });
  },
});
