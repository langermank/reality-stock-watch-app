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
      <ul className="mt-6 space-y-2 text-sm">
        <li className="text-neutral-400">
          Livestream reveal console — coming soon (#66)
        </li>
      </ul>
    </div>
  );
}
