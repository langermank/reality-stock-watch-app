import { NextRequest, NextResponse } from "next/server";
import { sendToUser, sendPushNotification } from "@/lib/push";
import { serviceClient } from "@/lib/supabase/service";
import type { PushPayload } from "@/lib/push";

/**
 * POST /api/push/send — send a push notification (admin/internal only).
 *
 * Auth: Bearer token must equal SUPABASE_SERVICE_ROLE_KEY.
 *
 * Body:
 *   { userId?: string, payload: PushPayload }
 *
 * If userId is omitted, broadcasts to all subscribed users.
 *
 * Called by:
 *   - Admin UI (manual sends)
 *   - Future survey cron triggers:
 *       • Survey goes live → broadcast to all
 *       • Survey closing in 1 hour → broadcast to all
 *       • Results published → broadcast to all
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: { userId?: string; payload: PushPayload } = await req.json();
  const { userId, payload } = body;

  if (userId) {
    await sendToUser(userId, payload);
  } else {
    // Broadcast to all subscribers
    const { data: subscriptions, error } = await serviceClient
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await Promise.allSettled(
      (subscriptions ?? []).map((sub) => sendPushNotification(sub, payload))
    );
  }

  return NextResponse.json({ ok: true });
}
