import Link from "next/link";

/**
 * Admin home. The first surface behind the is_admin gate; grows as Phase 4
 * admin (#42–44) and the livestream reveal console (#65/#66) land.
 */
export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Producer tools for Reality Stock Watch.
      </p>
      <ul className="mt-6 space-y-3 text-sm">
        <li>
          <Link
            href="/admin/reveal"
            className="block rounded-lg border border-neutral-200 bg-white p-4 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
          >
            <span className="block font-semibold">Livestream reveal console</span>
            <span className="mt-1 block text-neutral-500">
              Producer controls: pick a survey, Reveal Next, Reset.
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/stream"
            target="_blank"
            className="block rounded-lg border border-neutral-200 bg-white p-4 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
          >
            <span className="block font-semibold">Broadcast view ↗</span>
            <span className="mt-1 block text-neutral-500">
              Chrome-less trajectory chart. Capture this window in OBS.
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
