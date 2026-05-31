// Survey results visualization for state 5 of /survey (#79).
//
// Receives the pre-aggregated `QuestionResults[]` from lib/survey/results.ts
// and renders one chart per question. The aggregation layer is the contract
// — when survey builder (#44) lands and real fans submit, this view doesn't
// change; only the response count grows.
//
// Visual design intentionally restrained — see BarChart / RankingResults
// for redesign-friendly markup.

import type { QuestionResults } from "@/lib/survey/results";
import { BarChart } from "./BarChart";
import { RankingResults } from "./RankingResults";

type Props = {
  results: QuestionResults[];
};

export function ResultsView({ results }: Props) {
  if (results.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-neutral-400">
        No questions for this survey.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      {results.map((result) => (
        <article
          key={result.question.id}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
        >
          <header className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="text-base font-semibold text-neutral-100">
              {result.question.text}
            </h3>
            <span className="text-xs tabular-nums text-neutral-500">
              {result.responses} {result.responses === 1 ? "response" : "responses"}
            </span>
          </header>
          {result.type === "ranking" ? (
            <RankingResults buckets={result.buckets} responses={result.responses} />
          ) : (
            <BarChart
              buckets={result.buckets}
              responses={result.responses}
              multi={result.type === "multiple_choice"}
            />
          )}
        </article>
      ))}
    </section>
  );
}
