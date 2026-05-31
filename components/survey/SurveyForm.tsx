"use client";

// Survey form (issue #41).
//
// Renders all questions for a survey, owns the in-progress answers, runs a
// minimal "are we done" gate, and posts to the parent-supplied submit action.
// Used by both /survey (logged-in) and /survey/[id]/public (anonymous) — the
// submit action differs but the form is identical.

import { useState, useTransition } from "react";
import { Ranking } from "./Ranking";
import { SingleChoice, MultipleChoice } from "./Choice";
import type { SurveyQuestion } from "@/lib/survey/source";
import type { AnswerValue, SubmitResult } from "@/lib/survey/actions";

type Props = {
  surveyId: string;
  questions: SurveyQuestion[];
  submit: (
    surveyId: string,
    answers: Record<string, AnswerValue>,
  ) => Promise<SubmitResult>;
  onSubmitted?: () => void;
  submitLabel?: string;
};

/** Build an empty answer per question, sized correctly for ranking. */
function initialAnswers(questions: SurveyQuestion[]): Record<string, AnswerValue> {
  const result: Record<string, AnswerValue> = {};
  for (const question of questions) {
    if (question.type === "ranking") result[question.id] = [...question.options];
    else if (question.type === "multiple_choice") result[question.id] = [];
    else result[question.id] = "";
  }
  return result;
}

function isAnswered(question: SurveyQuestion, value: AnswerValue): boolean {
  if (question.type === "ranking") {
    return Array.isArray(value) && value.length === question.options.length;
  }
  if (question.type === "multiple_choice") {
    return Array.isArray(value) && value.length > 0;
  }
  return typeof value === "string" && value.length > 0;
}

export function SurveyForm({
  surveyId,
  questions,
  submit,
  onSubmitted,
  submitLabel = "Submit",
}: Props) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() =>
    initialAnswers(questions),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allAnswered = questions.every((question) => isAnswered(question, answers[question.id]));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await submit(surveyId, answers);
          if (result.ok) {
            onSubmitted?.();
            return;
          }
          setError(
            result.error === "already-submitted"
              ? "You've already submitted this survey."
              : result.error === "not-active"
                ? "This survey isn't open for submissions."
                : "Something went wrong. Try again?",
          );
        });
      }}
      className="flex flex-col gap-6"
    >
      {questions.map((question) => (
        <fieldset key={question.id} className="flex flex-col gap-3">
          <legend className="text-base font-semibold text-neutral-100">
            {question.text}
          </legend>
          {question.type === "ranking" ? (
            <Ranking
              id={`q-${question.id}`}
              options={question.options}
              value={(answers[question.id] as string[] | undefined) ?? []}
              onChange={(next) =>
                setAnswers((prev) => ({ ...prev, [question.id]: next }))
              }
            />
          ) : question.type === "multiple_choice" ? (
            <MultipleChoice
              name={`q-${question.id}`}
              options={question.options}
              value={(answers[question.id] as string[] | undefined) ?? []}
              onChange={(next) =>
                setAnswers((prev) => ({ ...prev, [question.id]: next }))
              }
            />
          ) : (
            <SingleChoice
              name={`q-${question.id}`}
              options={question.options}
              value={(answers[question.id] as string | undefined) ?? null}
              onChange={(next) =>
                setAnswers((prev) => ({ ...prev, [question.id]: next }))
              }
            />
          )}
        </fieldset>
      ))}

      {error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !allAnswered}
        className="rounded-xl bg-sky-500 px-4 py-3 text-base font-bold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
      >
        {isPending ? "Submitting…" : submitLabel}
      </button>
    </form>
  );
}
