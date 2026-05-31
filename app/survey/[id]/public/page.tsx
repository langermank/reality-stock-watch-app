// Anonymous public survey route (issue #41).
//
// Standalone — no auth required, no app nav (the layout above this is the
// chrome-less shell). When the survey is active we render the form against
// the service-role-backed anonymous submit path. Any other status surfaces
// a single "this survey is closed" sentence; the closed/results states are
// intentionally NOT exposed to anonymous users (decision in design doc).

import { getPublicSurvey } from "@/lib/survey/source";
import { PublicSurveyClient } from "@/components/survey/PublicSurveyClient";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function PublicSurveyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const state = await getPublicSurvey(id);

  if (!state) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6 text-center">
        <h1 className="text-2xl font-black tracking-tight">Survey not found</h1>
        <p className="mt-3 text-sm text-neutral-400">
          The link may be incorrect.
        </p>
      </main>
    );
  }

  if (state.kind === "closed") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6 text-center">
        <h1 className="text-2xl font-black tracking-tight">This survey is closed</h1>
        <p className="mt-3 text-sm text-neutral-400">
          Thanks for your interest. Check back next week.
        </p>
      </main>
    );
  }

  return <PublicSurveyClient survey={state.survey} questions={state.questions} />;
}
