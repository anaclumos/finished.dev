import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const processAgentWebhook = internalMutation({
  args: {
    agentId: v.string(),
    eventType: v.string(),
    providerEventId: v.string(),
    message: v.string(),
    dedupeKey: v.optional(v.string()),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId as Id<"agents">);

    if (!agent) {
      throw new Error("Agent not found");
    }

    const dedupeKey = args.dedupeKey ?? args.providerEventId;
    const inboxProvider = "agent";
    const notificationDedupeKey = `agent:${args.agentId}:${dedupeKey}`;

    const existingInbox = await ctx.db
      .query("webhookInbox")
      .withIndex("by_provider_event", (q) =>
        q.eq("provider", inboxProvider).eq("providerEventId", args.providerEventId),
      )
      .first();

    let inboxId: Id<"webhookInbox"> | undefined;

    if (!existingInbox) {
      inboxId = await ctx.db.insert("webhookInbox", {
        provider: inboxProvider,
        providerEventId: args.providerEventId,
        payload: args.payload,
        status: "pending",
      });
    }

    const existingEvent = await ctx.db
      .query("agentEvents")
      .withIndex("by_agent_provider_event", (q) =>
        q
          .eq("agentId", args.agentId as Id<"agents">)
          .eq("providerEventId", args.providerEventId),
      )
      .first();

    if (!existingEvent) {
      await ctx.db.insert("agentEvents", {
        agentId: args.agentId as Id<"agents">,
        eventType: args.eventType,
        providerEventId: args.providerEventId,
        payload: args.payload,
      });
    }

    const existingJob = await ctx.db
      .query("notificationJobs")
      .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", notificationDedupeKey))
      .first();

    if (!existingJob) {
      const notificationPayload = {
        agentId: args.agentId,
        eventType: args.eventType,
        providerEventId: args.providerEventId,
        message: args.message,
        payload: args.payload,
      };

      await ctx.db.insert("notificationJobs", {
        userId: agent.userId,
        sourceInboxId: inboxId,
        channel: "agent_webhook",
        dedupeKey: notificationDedupeKey,
        payload: notificationPayload,
        status: "pending",
        runAt: Date.now(),
        attempts: 0,
      });
    }
  },
});
