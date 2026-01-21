import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { verifyQstashSignature } from "@/lib/qstash";

export const runtime = "nodejs";

const webhookSchema = z
  .object({
    event_type: z.string().min(1),
    provider_event_id: z.string().min(1),
    message: z.string().min(1),
    dedupe_key: z.string().min(1).optional(),
  })
  .passthrough();

const paramsSchema = z.object({
  agentId: z.string().uuid(),
});

export async function POST(request: Request, context: { params: { agentId: string } }) {
  const params = paramsSchema.safeParse(context.params);

  if (!params.success) {
    return NextResponse.json({ message: "Invalid agent id" }, { status: 400 });
  }

  const secretFromHeader = request.headers.get("x-agent-secret") ?? undefined;
  const secretFromQuery = new URL(request.url).searchParams.get("secret") ?? undefined;
  const providedSecret = secretFromHeader ?? secretFromQuery;

  if (!providedSecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const agentSecret =
    process.env[`AGENT_WEBHOOK_SECRET_${params.data.agentId}`] ??
    process.env.AGENT_WEBHOOK_SECRET;

  if (!agentSecret) {
    return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
  }

  if (providedSecret !== agentSecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text().catch(() => null);

  if (!rawBody) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const qstashSignature =
    request.headers.get("x-qstash-signature") ?? request.headers.get("upstash-signature");

  if (qstashSignature && !verifyQstashSignature({ signature: qstashSignature, body: rawBody })) {
    return NextResponse.json({ message: "Invalid QStash signature" }, { status: 401 });
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(parsedJson);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const agent = await db.query.agents.findFirst({
    where: (table, { eq }) => eq(table.id, params.data.agentId),
  });

  if (!agent) {
    return NextResponse.json({ message: "Agent not found" }, { status: 404 });
  }

  const payload = parsed.data;
  const dedupeKey = payload.dedupe_key ?? payload.provider_event_id;
  const inboxProvider = "agent";
  const notificationDedupeKey = `agent:${params.data.agentId}:${dedupeKey}`;
  const notificationPayload = {
    agentId: params.data.agentId,
    eventType: payload.event_type,
    providerEventId: payload.provider_event_id,
    message: payload.message,
    payload,
  };

  try {
    const inboxResult = await db
      .insert(schema.webhookInbox)
      .values({
        provider: inboxProvider,
        providerEventId: payload.provider_event_id,
        payload,
      })
      .onConflictDoNothing({
        target: [schema.webhookInbox.provider, schema.webhookInbox.providerEventId],
      })
      .returning({ id: schema.webhookInbox.id });

    const inboxId = inboxResult[0]?.id;

    await db
      .insert(schema.agentEvents)
      .values({
        agentId: params.data.agentId,
        eventType: payload.event_type,
        providerEventId: payload.provider_event_id,
        payload,
      })
      .onConflictDoNothing({
        target: [schema.agentEvents.agentId, schema.agentEvents.providerEventId],
      });

    await db
      .insert(schema.notificationJobs)
      .values({
        userId: agent.userId,
        sourceInboxId: inboxId,
        channel: "agent_webhook",
        dedupeKey: notificationDedupeKey,
        payload: notificationPayload,
      })
      .onConflictDoNothing({
        target: [schema.notificationJobs.dedupeKey],
      });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Failed to process webhook" }, { status: 500 });
  }
}
