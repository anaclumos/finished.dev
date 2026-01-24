import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/webhooks/:agentId",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const agentId = pathParts[pathParts.length - 1];

    if (!agentId) {
      return new Response(JSON.stringify({ message: "Invalid agent id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const secretFromHeader = request.headers.get("x-agent-secret") ?? undefined;
    const secretFromQuery = url.searchParams.get("secret") ?? undefined;
    const providedSecret = secretFromHeader ?? secretFromQuery;

    if (!providedSecret) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const agentSecret = process.env.AGENT_WEBHOOK_SECRET;

    if (!agentSecret) {
      return new Response(
        JSON.stringify({ message: "Webhook secret not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (providedSecret !== agentSecret) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rawBody = await request.text().catch(() => null);

    if (!rawBody) {
      return new Response(JSON.stringify({ message: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ message: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = parsedJson as {
      event_type?: string;
      provider_event_id?: string;
      message?: string;
      dedupe_key?: string;
    };

    if (
      !payload.event_type ||
      !payload.provider_event_id ||
      !payload.message
    ) {
      return new Response(JSON.stringify({ message: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await ctx.runMutation(internal.webhooks.processAgentWebhook, {
        agentId,
        eventType: payload.event_type,
        providerEventId: payload.provider_event_id,
        message: payload.message,
        dedupeKey: payload.dedupe_key,
        payload: parsedJson,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to process webhook";
      const status = message === "Agent not found" ? 404 : 500;
      return new Response(JSON.stringify({ message }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
