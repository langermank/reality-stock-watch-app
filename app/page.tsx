import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

/** Logged-out homepage. Authenticated users go straight to Market. */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/market");

  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Reality Stock Watch
            </h1>
            <p className="text-lg text-neutral-300">
              Buy and sell shares in Big Brother houseguests.
              <br />
              Prices move 24/7 based on real trading.
            </p>
          </div>

          <p className="text-sm text-neutral-500">
            Free to play · Fake money · Real competition
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-white text-neutral-950 px-8 py-3 text-sm font-semibold hover:bg-neutral-100 transition-colors"
          >
            Get started
          </Link>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-neutral-600">
        For the RHAP community · Season coming soon
      </footer>
    </div>
  );
}
