"use client";

// State switcher for the logged-in survey page (issue #41).
//
// Receives the discriminated `SurveyPageState` from the server and renders
// the right surface for each of the five states. Form submission flips
// active-not-submitted -> active-submitted via a local optimistic flag, and
// router.refresh re-reads the server state so subsequent renders use the
// real DB row.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SurveyForm } from "./SurveyForm";
import { YourPicks } from "./YourPicks";
import { PushPrompt } from "./PushPrompt";
import { ResultsView } from "./results/ResultsView";
import { submitResponse } from "@/lib/survey/actions";
import type { SurveyMeta, SurveyPageState, SurveyQuestion } from "@/lib/survey/source";

function SurveyHeader({ title, weekNumber }: { title: string; weekNumber: number }) {
  return (
    <header className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
        Week {weekNumber}
      </p>
      <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-100">{title}</h1>
    </header>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl p-6">{children}</div>;
}

function ThanksBanner() {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
      <p className="text-base font-semibold text-emerald-200">
        Thanks for your response!
      </p>
      <p className="mt-1 text-sm text-emerald-100/80">
        Results will be posted after the survey closes.
      </p>
    </div>
  );
}

/** Render for the active-submitted state (also reused as the optimistic
 *  "just submitted" view after a successful form post). */
function SubmittedView({
  survey,
  questions,
  answers,
}: {
  survey: SurveyMeta;
  questions: SurveyQuestion[];
  answers: Record<string, unknown> | null;
}) {
  return (
    <Card>
      <SurveyHeader title={survey.title} weekNumber={survey.weekNumber} />
      <ThanksBanner />
      {answers && Object.keys(answers).length > 0 && (
        <YourPicks questions={questions} answers={answers} />
      )}
    </Card>
  );
}

export function SurveyView({ state }: { state: SurveyPageState }) {
  const router = useRouter();
  // Optimistic flip: after submit succeeds we render SubmittedView
  // immediately while router.refresh re-reads the DB in the background.
  const [optimisticAnswers, setOptimisticAnswers] = useState<Record<
    string,
    unknown
  > | null>(null);

  if (state.kind === "no-active") {
    return (
      <Card>
        <h1 className="text-2xl font-black tracking-tight text-neutral-100">Survey</h1>
        <p className="mt-3 text-sm text-neutral-400">
          No survey right now — check back soon.
        </p>
      </Card>
    );
  }

  if (state.kind === "active-not-submitted") {
    if (optimisticAnswers) {
      return (
        <SubmittedView
          survey={state.survey}
          questions={state.questions}
          answers={optimisticAnswers}
        />
      );
    }
    return (
      <Card>
        <SurveyHeader title={state.survey.title} weekNumber={state.survey.weekNumber} />
        <SurveyForm
          surveyId={state.survey.id}
          questions={state.questions}
          submit={async (surveyId, answers) => {
            const result = await submitResponse(surveyId, answers);
            if (result.ok) {
              setOptimisticAnswers(answers);
              router.refresh();
            }
            return result;
          }}
          submitLabel="Submit response"
        />
        <div className="mt-8">
          <PushPrompt />
        </div>
      </Card>
    );
  }

  if (state.kind === "active-submitted") {
    return (
      <SubmittedView
        survey={state.survey}
        questions={state.questions}
        answers={state.answers}
      />
    );
  }

  if (state.kind === "closed-pending") {
    return (
      <Card>
        <SurveyHeader title={state.survey.title} weekNumber={state.survey.weekNumber} />
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-base font-semibold text-neutral-100">Survey closed.</p>
          <p className="mt-1 text-sm text-neutral-400">
            Check back soon for results.
          </p>
        </div>
        {state.answers && (
          <YourPicks questions={state.questions} answers={state.answers} />
        )}
      </Card>
    );
  }

  // results-published
  return (
    <Card>
      <SurveyHeader title={state.survey.title} weekNumber={state.survey.weekNumber} />
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
        Results
      </p>
      <ResultsView results={state.results} />
      {state.answers && (
        <div className="mt-6">
          <YourPicks questions={state.questions} answers={state.answers} />
        </div>
      )}
    </Card>
  );
}
