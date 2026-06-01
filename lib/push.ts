import webpush from "web-push";
import { serviceClient } from "@/lib/supabase/service";

webpush.setVapidDetails(
  "mailto:langermank@gmail.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export type PushSubscriptionRecord = {
  endpoint: string;
  p256dh: string;
  auth_key: string;
};

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

/** Send a push notification to one subscription. Deletes dead (410) subscriptions. */
export async function sendPushNotification(
  subscription: PushSubscriptionRecord,
  payload: PushPayload
): Promise<void> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth_key,
        },
      },
      JSON.stringify(payload)
    );
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410) {
      // Subscription expired — remove from DB
      await serviceClient
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", subscription.endpoint);
    } else {
      throw err;
    }
  }
}

/**
 * Fan out a push notification to all subscriptions for a user.
 *
 * Notification triggers (not yet wired to cron):
 *   - Survey live → call sendToUser for every user
 *   - Survey closing in 1 hour → call sendToUser for every user
 *   - Results published → call sendToUser for every user
 */
export async function sendToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  const { data: subscriptions, error } = await serviceClient
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", userId);

  if (error) throw error;
  if (!subscriptions?.length) return;

  await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );
}

/**
 * Broadcast a push notification to every subscribed user. Best-effort: each
 * subscription send is independent (Promise.allSettled), so a single dead
 * subscription doesn't block the rest. Callers don't need to handle errors —
 * dead subscriptions self-clean inside sendPushNotification.
 */
export async function sendToAll(payload: PushPayload): Promise<void> {
  const { data: subscriptions, error } = await serviceClient
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key");
  if (error) throw error;
  if (!subscriptions?.length) return;
  await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );
}
