import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import webPush from "web-push";

import { db } from "@/lib/db";
import { notificationJobs, pushSubscriptions } from "@/lib/db/schema";
import { verifyQstashSignature } from "@/lib/qstash";

export const runtime = "nodejs";

const INVALID_SUBSCRIPTION_STATUS_CODES = new Set([404, 410]);

export async function POST(request: Request) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return NextResponse.json({ message: "VAPID keys are not configured" }, { status: 500 });
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

  webPush.setVapidDetails("mailto:notifications@finished.dev", publicKey, privateKey);

  const now = new Date();
  const jobs = await db.query.notificationJobs.findMany({
    where: (table, { and, eq, lte }) =>
      and(eq(table.status, "pending"), lte(table.runAt, now)),
  });

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let disabledSubscriptions = 0;

  for (const job of jobs) {
    processed += 1;

    if (!job.userId) {
      await db
        .update(notificationJobs)
        .set({
          status: "failed",
          attempts: job.attempts + 1,
          lastError: "Missing user id",
          updatedAt: new Date(),
        })
        .where(eq(notificationJobs.id, job.id));
      failed += 1;
      continue;
    }

    const subscriptions = await db.query.pushSubscriptions.findMany({
      where: (table, { and, eq }) => and(eq(table.userId, job.userId), eq(table.enabled, true)),
    });

    let hasFailure = false;
    let lastError: string | null = null;

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(job.payload),
        );
      } catch (error) {
        const statusCode =
          error && typeof error === "object" && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : undefined;

        if (statusCode && INVALID_SUBSCRIPTION_STATUS_CODES.has(statusCode)) {
          await db
            .update(pushSubscriptions)
            .set({ enabled: false })
            .where(eq(pushSubscriptions.id, subscription.id));
          disabledSubscriptions += 1;
          continue;
        }

        hasFailure = true;
        lastError =
          error && typeof error === "object" && "message" in error
            ? String((error as { message?: string }).message)
            : "Failed to send push notification";
      }
    }

    const status = hasFailure ? "failed" : "success";

    await db
      .update(notificationJobs)
      .set({
        status,
        attempts: job.attempts + 1,
        lastError: hasFailure ? lastError : null,
        updatedAt: new Date(),
      })
      .where(eq(notificationJobs.id, job.id));

    if (hasFailure) {
      failed += 1;
    } else {
      succeeded += 1;
    }
  }

  return NextResponse.json({
    processed,
    succeeded,
    failed,
    disabledSubscriptions,
  });
}
