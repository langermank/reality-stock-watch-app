"use client";

// Ephemeral cursor / scrub broadcast for the livestream reveal (#78).
//
// The producer screen-shares /admin/stream in OBS and uses /admin/reveal as a
// remote control. Anything they do in the console preview (hover, click, week
// scrub) needs to appear on the broadcast view in real time — without writing
// to Postgres, because cursor moves at 60 Hz would hammer the DB.
//
// The right Supabase primitive is the Realtime "broadcast" channel (separate
// from postgres_changes): ephemeral pub-sub, no persistence, fan-out to all
// subscribers. We open one channel per season — `reveal-cursor-<seasonId>` —
// and every reveal surface joins it. Senders broadcast cursor state; receivers
// pick it up and render it.
//
// Throttling: outgoing events are coalesced to one every CURSOR_INTERVAL_MS
// (last value wins). With a hover that fires per pixel-move that's 60 fps →
// 20 Hz on the wire, plenty smooth for animation but doesn't saturate.
//
// Security note: the channel is name-scoped, not RLS-gated. Both surfaces that
// use it (/admin/stream and /admin/reveal) sit behind requireAdmin(), so any
// real-world subscriber is an admin already. If we ever expose a route that
// doesn't gate, gate the channel via a Realtime authorization policy.

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const CURSOR_INTERVAL_MS = 50;
const CURSOR_EVENT = "cursor";

export type CursorState = {
  /** Contestant id currently hovered in the sender's preview, or null. */
  hoveredId: string | null;
  /** Contestant id explicitly clicked-to-focus (sustained), or null. */
  focusedId: string | null;
  /** Week the sender is scrubbed to, or null when following the on-air pointer. */
  scrubbedWeekId: string | null;
};

const EMPTY: CursorState = { hoveredId: null, focusedId: null, scrubbedWeekId: null };

type UseRevealCursorResult = {
  /** Latest cursor state seen on the channel (or EMPTY before any message). */
  cursor: CursorState;
  /** Push a new cursor state to all subscribers. Throttled — last value wins. */
  send: (next: CursorState) => void;
};

export function useRevealCursor(seasonId: string): UseRevealCursorResult {
  const [cursor, setCursor] = useState<CursorState>(EMPTY);

  // Channel + pending-send state kept in refs so identity is stable across renders.
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pendingRef = useRef<CursorState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef<CursorState>(EMPTY);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      // RLS doesn't apply to broadcast channels, but setting the auth token
      // mirrors the postgres_changes path and future-proofs us if we add a
      // Realtime authorization policy. Cheap, harmless.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      await supabase.realtime.setAuth(session?.access_token ?? null);
      if (!active) return;

      const channel = supabase.channel(`reveal-cursor-${seasonId}`, {
        config: { broadcast: { self: false } },
      });
      channel.on("broadcast", { event: CURSOR_EVENT }, ({ payload }) => {
        setCursor(payload as CursorState);
      });
      await channel.subscribe();
      channelRef.current = channel;
    })();

    return () => {
      active = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [seasonId]);

  const flush = useCallback(() => {
    timerRef.current = null;
    const value = pendingRef.current;
    pendingRef.current = null;
    if (!value || !channelRef.current) return;
    lastSentRef.current = value;
    void channelRef.current.send({
      type: "broadcast",
      event: CURSOR_EVENT,
      payload: value,
    });
  }, []);

  const send = useCallback(
    (next: CursorState) => {
      // Skip outright if nothing changed since the last send — cuts noise.
      const last = lastSentRef.current;
      if (
        next.hoveredId === last.hoveredId &&
        next.focusedId === last.focusedId &&
        next.scrubbedWeekId === last.scrubbedWeekId
      ) {
        return;
      }
      pendingRef.current = next;
      if (timerRef.current) return; // already scheduled — last-value-wins
      timerRef.current = setTimeout(flush, CURSOR_INTERVAL_MS);
    },
    [flush],
  );

  return { cursor, send };
}
