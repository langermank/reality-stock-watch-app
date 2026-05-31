"use client";

// Client wrapper for the anonymous public survey route.
//
// Lives separately from /survey's SurveyView because the surrounding chrome
// is fundamentally different: no app nav, a post-submit confirmation that
// pitches account creation rather than a "your picks" inline view, and a
// closed-state that's just a single sentence with no path back into the app
// (decision in interaction-flow-survey.md).

import { useState } from "react";
import Link from "next/link";
import { SurveyForm } from "./SurveyForm";
import { submitAnonymousResponse } from "@/lib/survey/actions";
import type { SurveyMeta, SurveyQuestion } from "@/lib/survey/source";

type Props = {
  survey: SurveyMeta;
  questions: SurveyQuestion[];
};

export function PublicSurveyClient({ survey, questions }: Props) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6 text-center">
        <h1 className="text-2xl font-black tracking-tight">Response submitted</h1>
        <p className="mt-3 text-sm text-neutral-400">
          Thanks for taking the survey.
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold text-neutral-100">
            Want to see the results?
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Create an account to view how others voted once results are
            published, and follow the next survey live.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400"
          >
            Create an account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
          Week {survey.weekNumber}
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">{survey.title}</h1>
      </header>
      <SurveyForm
        surveyId={survey.id}
        questions={questions}
        submit={submitAnonymousResponse}
        submitLabel="Submit response"
        onSubmitted={() => setSubmitted(true)}
      />
    </main>
  );
}
