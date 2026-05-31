// Broadcast graph view (issue #65) — the chrome-less surface the producer
// captures with OBS. Admin-gated by app/admin/layout.tsx (requireAdmin); never
// public. Loads the season's rankings + reveal pointer server-side via the data
// seam, then hands off to a client component that animates reveals live over
// Supabase Realtime.

import { getRevealData } from "@/lib/reveal/source";
import { BroadcastLive } from "@/components/reveal/BroadcastLive";

// Reveal state is read per-request and changes live; never statically cache.
export const dynamic = "force-dynamic";

export default async function BroadcastStreamPage() {
  const data = await getRevealData();

  if (!data) {
    return (
      <div className="grid h-dvh w-full place-items-center bg-[#05060b] p-8 text-center text-slate-400">
        <div>
          <p className="text-lg font-semibold text-slate-200">No reveal data yet</p>
          <p className="mt-2 text-sm">
            This view needs an active season with seeded aggregate rankings and a
            reveal pointer. Once a survey&apos;s rankings exist, they appear here.
          </p>
        </div>
      </div>
    );
  }

  return <BroadcastLive initial={data} />;
}
