// Producer reveal console (issue #66) — admin-only control surface.
//
// Admin-gated by app/admin/layout.tsx (requireAdmin). Loads the same data the
// broadcast view loads; the console writes to survey_reveal_state via server
// actions and both surfaces re-render via Realtime. Producer runs THIS in one
// window and /admin/stream in another (captured by OBS).

import { getRevealData } from "@/lib/reveal/source";
import { RevealConsole } from "@/components/reveal/RevealConsole";

// Reveal state changes per-request; never statically cache.
export const dynamic = "force-dynamic";

export default async function RevealConsolePage() {
  const data = await getRevealData();

  if (!data) {
    return (
      <div className="grid h-dvh w-full place-items-center bg-neutral-950 p-8 text-center text-slate-400">
        <div>
          <p className="text-lg font-semibold text-slate-200">No reveal data yet</p>
          <p className="mt-2 text-sm">
            The console needs an active season with at least one survey that has
            aggregate rankings. Once a survey&apos;s rankings exist, they appear here.
          </p>
        </div>
      </div>
    );
  }

  return <RevealConsole initial={data} />;
}
