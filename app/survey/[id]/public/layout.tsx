// Standalone layout for the anonymous public survey link (issue #41).
//
// Lives OUTSIDE the (app) group so the global nav/header/trade overlay don't
// render here. Anonymous users are intentionally not "app users" — the
// experience is a single page with no path back into the rest of the app.

export default function PublicSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-neutral-950 text-neutral-100">{children}</div>;
}
