// Read-only render of the user's submitted answers ("Your picks" / "Your
// response"). Shown across the submitted, closed-pending, and
// results-published states.

import type { SurveyQuestion } from "@/lib/survey/source";

type Props = {
  questions: SurveyQuestion[];
  answers: Record<string, unknown>;
  title?: string;
};

function formatAnswer(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return ["(no answer)"];
}

export function YourPicks({ questions, answers, title = "Your picks" }: Props) {
  // If we don't have questions (e.g. closed survey we can't read), render only
  // the answer keys/values opaquely so the user still sees what they sent.
  if (questions.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-neutral-400">
          {title}
        </h2>
        <ul className="flex flex-col gap-3">
          {Object.entries(answers).map(([key, value]) => (
            <li key={key} className="text-sm">
              <p className="text-neutral-300">{formatAnswer(value).join(" · ")}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-neutral-400">
        {title}
      </h2>
      <dl className="flex flex-col gap-4">
        {questions.map((question) => {
          const lines = formatAnswer(answers[question.id]);
          return (
            <div key={question.id}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {question.text}
              </dt>
              <dd className="mt-1 text-sm text-neutral-100">
                {question.type === "ranking" ? (
                  <ol className="list-inside list-decimal space-y-0.5">
                    {lines.map((line, i) => (
                      <li key={i} className="tabular-nums">
                        {line}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>{lines.join(", ")}</p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
