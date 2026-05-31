"use client";

// Realtime subscription to the producer's reveal pointer (issue #65/#66).
//
// survey_reveal_state holds (selected_survey_id, reveal_count) per season.
// Both the broadcast view (`/admin/stream`) and the producer console
// (`/admin/reveal`) read from this single row; both subscribe here so a write
// from the console fans out to every surface that's listening.
//
// The table is admin-only (RLS), and Supabase Realtime enforces RLS against
// the SOCKET'S token. Without setAuth() the broadcast socket joins anonymous
// and change events are silently filtered out — see PR #72 commit for the
// concrete bug this prevents.

import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type RevealPointer = {
  selectedWeekId: string;
  revealCount: number;
};

export function useRevealState(seasonId: string, initial: RevealPointer): RevealPointer {
  // Seed once on mount; Realtime drives every subsequent update. Callers pass
  // `initial` as an inline object, so it's a fresh reference each render —
  // depending on it in an effect would loop. State below is the source of
  // truth after mount.
  const [pointer, setPointer] = useState<RevealPointer>(initial);

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;
    let active = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      await supabase.realtime.setAuth(session?.access_token ?? null);
      if (!active) return;

      channel = supabase
        .channel(`reveal-state-${seasonId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "survey_reveal_state",
            filter: `season_id=eq.${seasonId}`,
          },
          (payload) => {
            const row = payload.new as {
              reveal_count?: number;
              selected_survey_id?: string | null;
            };
            setPointer((current) => ({
              selectedWeekId: row.selected_survey_id ?? current.selectedWeekId,
              revealCount:
                typeof row.reveal_count === "number" ? row.reveal_count : current.revealCount,
            }));
          },
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [seasonId]);

  return pointer;
}
