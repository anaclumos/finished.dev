import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import webPush from "web-push";

import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";

const INVALID_SUBSCRIPTION_STATUS_CODES = new Set([404, 410]);

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { message: "VAPID keys are not configured" },
      { status: 500 },
    );
  }

  const rawBody = await request.text().catch(() => null);

  if (!rawBody) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  webPush.setVapidDetails(
    "mailto:notifications@finished.dev",
    publicKey,
    privateKey,
  );

  const jobs = await convex.query(api.notificationJobs.listPendingDue, {});

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let disabledSubscriptions = 0;

  for (const job of jobs) {
    processed += 1;

    if (!job.userId) {
      await convex.mutation(api.notificationJobs.markFailed, {
        id: job._id,
        error: "Missing user id",
      });
      failed += 1;
      continue;
    }

    const subscriptions = await convex.query(
      api.pushSubscriptions.listEnabledByUser,
      { userId: job.userId },
    );

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
          await convex.mutation(api.pushSubscriptions.disable, {
            id: subscription._id,
          });
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

    if (hasFailure) {
      await convex.mutation(api.notificationJobs.markFailed, {
        id: job._id,
        error: lastError ?? "Unknown error",
      });
      failed += 1;
    } else {
      await convex.mutation(api.notificationJobs.markSuccess, { id: job._id });
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
