import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { z } from "zod";

import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
});

export async function POST(request: Request) {
  const { userId: clerkId } = auth();

  if (!clerkId) {
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
    const user = await convex.query(api.users.getByClerkId, { clerkId });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await convex.mutation(api.pushSubscriptions.upsert, {
      userId: user._id,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth,
      userAgent: payload.userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Failed to store subscription" },
      { status: 500 },
    );
  }
}
