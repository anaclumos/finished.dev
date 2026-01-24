import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listPendingDue = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const jobs = await ctx.db
      .query("notificationJobs")
      .withIndex("by_status_run_at", (q) => q.eq("status", "pending"))
      .collect();
    return jobs.filter((job) => job.runAt <= now);
  },
});

export const insertIfNotExists = mutation({
  args: {
    userId: v.optional(v.id("users")),
    sourceInboxId: v.optional(v.id("webhookInbox")),
    channel: v.string(),
    dedupeKey: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationJobs")
      .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", args.dedupeKey))
      .first();

    if (existing) {
      return null;
    }

    return ctx.db.insert("notificationJobs", {
      userId: args.userId,
      sourceInboxId: args.sourceInboxId,
      channel: args.channel,
      dedupeKey: args.dedupeKey,
      payload: args.payload,
      status: "pending",
      runAt: Date.now(),
      attempts: 0,
    });
  },
});

export const markSuccess = mutation({
  args: { id: v.id("notificationJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) return;
    await ctx.db.patch(args.id, {
      status: "success",
      attempts: job.attempts + 1,
      lastError: undefined,
    });
  },
});

export const markFailed = mutation({
  args: {
    id: v.id("notificationJobs"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) return;
    await ctx.db.patch(args.id, {
      status: "failed",
      attempts: job.attempts + 1,
      lastError: args.error,
    });
  },
});
