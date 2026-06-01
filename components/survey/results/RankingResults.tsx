// Ranking-question results (#79).
//
// Shows Borda points as a bar chart with the average submitted position as a
// companion stat. Same visual restraint as BarChart — redesign freely.

import type { RankingBucket } from "@/lib/survey/results";

type Props = {
  buckets: RankingBucket[];
  responses: number;
};

export function RankingResults({ buckets }: Props) {
  if (buckets.length === 0) {
    return <p className="text-sm text-neutral-500">No responses yet.</p>;
  }

  const max = Math.max(...buckets.map((b) => b.score), 1);

  return (
    <ul className="flex flex-col gap-2">
      {buckets.map((bucket) => {
        const widthPct = (bucket.score / max) * 100;
        const isTop = bucket.rank === 1;
        return (
          <li key={bucket.option} className="text-sm">
            <div className="flex items-baseline gap-3">
              <span className="grid h-6 w-7 shrink-0 place-items-center rounded text-xs font-bold tabular-nums text-neutral-300">
                {bucket.rank}
              </span>
              <span className="flex-1 truncate font-medium text-neutral-100">
                {bucket.option}
              </span>
              <span className="text-xs tabular-nums text-neutral-500">
                avg #{bucket.averagePosition.toFixed(1)}
              </span>
              <span className="w-12 text-right tabular-nums text-neutral-400">
                {bucket.score}
              </span>
            </div>
            <div className="ml-10 mt-1 h-2 overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className={`h-full rounded-full transition-[width] ${
                  isTop ? "bg-emerald-400" : "bg-emerald-500/40"
                }`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
