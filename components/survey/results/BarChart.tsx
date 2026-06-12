// Shared bar chart for single_choice + multiple_choice survey results (#79).
//
// Restrained on purpose — the goal of #79 was to ship a working chart so the
// design can be iterated without rewiring the data layer. Everything below
// the // ---- presentation ---- marker is fair game to redesign.

import type { ChoiceBucket } from "@/lib/survey/results";

type Props = {
  buckets: ChoiceBucket[];
  /** Total responses. Not rendered yet — kept in the contract for the planned
   *  "N votes / X%" caption (see the design-iteration note above). */
  responses: number;
  /** If true, treat each respondent as potentially selecting multiple → caption phrasing. */
  multi?: boolean;
};

export function BarChart({ buckets, multi }: Props) {
  if (buckets.length === 0) {
    return (
      <p className="text-sm text-neutral-500">No responses yet.</p>
    );
  }

  // The max is what 100% of the bar represents. For single_choice this caps at
  // responses; for multiple_choice the same option can stack up to responses too.
  const max = Math.max(...buckets.map((b) => b.count), 1);

  // ---- presentation ----
  return (
    <ul className="flex flex-col gap-2">
      {buckets.map((bucket, index) => {
        const widthPct = (bucket.count / max) * 100;
        const isTop = index === 0 && bucket.count > 0;
        return (
          <li key={bucket.option} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-neutral-100 truncate">{bucket.option}</span>
              <span className="tabular-nums text-neutral-400">
                {bucket.count}
                {multi ? null : (
                  <span className="ml-1.5 text-xs text-neutral-500">
                    · {Math.round(bucket.share * 100)}%
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className={`h-full rounded-full transition-[width] ${
                  isTop ? "bg-sky-400" : "bg-sky-500/40"
                }`}
                style={{ width: `${Math.max(widthPct, bucket.count === 0 ? 0 : 2)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
