import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

export const runtime = "nodejs";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
});

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const parsed = subscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const payload = parsed.data;

  try {
    const existing = await db.query.pushSubscriptions.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, userId), eq(table.endpoint, payload.endpoint)),
    });

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({
          p256dh: payload.p256dh,
          auth: payload.auth,
          userAgent: payload.userAgent,
          enabled: true,
        })
        .where((table, { eq }) => eq(table.id, existing.id));
    } else {
      await db.insert(pushSubscriptions).values({
        userId,
        endpoint: payload.endpoint,
        p256dh: payload.p256dh,
        auth: payload.auth,
        userAgent: payload.userAgent,
        enabled: true,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Failed to store subscription" }, { status: 500 });
  }
}
