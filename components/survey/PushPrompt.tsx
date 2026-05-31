"use client";

// Inline push-notification permission prompt for the survey page (issue #41).
//
// Hidden states (so the surface never nags):
//   - The browser doesn't support Notification or PushManager
//   - Permission already granted (subscription exists or is being created)
//   - Permission already denied — we can't re-prompt without OS-level fixes,
//     and a "you said no" reminder is hostile
//
// On click: ask the browser, subscribe via PushManager, POST the subscription
// to /api/push/subscribe (auth required — survey page is already gated).

import { useEffect, useState } from "react";

function urlBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const value = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(value);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) arr[i] = raw.charCodeAt(i);
  return buffer;
}

type Status = "hidden" | "prompt" | "subscribing" | "subscribed" | "error";

export function PushPrompt() {
  const [status, setStatus] = useState<Status>("hidden");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined") return;
      if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
      if (Notification.permission === "denied") return;
      if (Notification.permission === "granted") {
        // Already permitted; check for an existing subscription so we don't
        // surface a button that does nothing.
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          const existing = await reg?.pushManager.getSubscription();
          if (existing) return; // truly subscribed → leave hidden
        } catch {
          /* fall through to prompt — best-effort */
        }
      }
      if (!cancelled) setStatus("prompt");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "hidden") return null;

  if (status === "subscribed") {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
        Notifications enabled — we&apos;ll ping you when results land.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
        Couldn&apos;t enable notifications. You can try again later from your browser settings.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={status === "subscribing"}
      onClick={async () => {
        setStatus("subscribing");
        try {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            setStatus("hidden");
            return;
          }
          // The PWA service worker registration is owned by the app shell.
          // Wait for it to be ready rather than re-registering here.
          const reg = await navigator.serviceWorker.ready;
          const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapid) {
            setStatus("error");
            return;
          }
          const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToArrayBuffer(vapid),
          });
          const json = subscription.toJSON();
          const response = await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: json.endpoint,
              keys: json.keys,
            }),
          });
          if (!response.ok) {
            setStatus("error");
            return;
          }
          setStatus("subscribed");
        } catch {
          setStatus("error");
        }
      }}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.08] disabled:opacity-50"
    >
      🔔{" "}
      {status === "subscribing"
        ? "Enabling notifications…"
        : "Notify me when results are posted"}
    </button>
  );
}
