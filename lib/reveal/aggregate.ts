// NEW (#64b): turn N fan ranking-submissions into one ordered, scored list.
// Not frozen — written cleanly. Borda is the default; an alternate strategy
// (e.g. average-rank) can be swapped via the `strategy` param.

/**
 * A single fan's ranking submission: an ordered list of contestant ids,
 * best (position 0) first. Position in the array IS the submitted rank.
 */
export type RankingSubmission = {
  /** Contestant ids in ranked order, index 0 = top pick. */
  order: string[]
}

export type AggregateResult = {
  contestantId: string
  rank: number
  score: number
}

/**
 * A scoring strategy reduces all submissions to a per-contestant score.
 * Higher score = better. Ranking (order by score desc) is applied afterward.
 */
export type AggregateStrategy = (submissions: RankingSubmission[]) => Map<string, number>

/**
 * Borda count: each submission awards `(N - position)` points to each
 * contestant, where N is the number of contestants in that submission and
 * position is the contestant's 0-indexed slot. Points are summed across all
 * submissions. Top of a list of N earns N points, bottom earns 1.
 */
export const bordaStrategy: AggregateStrategy = (submissions) => {
  const scores = new Map<string, number>()

  for (const submission of submissions) {
    const n = submission.order.length
    submission.order.forEach((contestantId, position) => {
      const points = n - position
      scores.set(contestantId, (scores.get(contestantId) ?? 0) + points)
    })
  }

  return scores
}

/**
 * Average finishing position: `score` is the mean submitted rank (1-indexed),
 * inverted so that higher = better (up = good for the chart). A contestant's
 * mean position `p` becomes `(maxN + 1) - p`, where `maxN` is the largest
 * submission length seen — keeping scores positive and comparable to Borda's
 * "higher is better" convention.
 */
export const averageRankStrategy: AggregateStrategy = (submissions) => {
  const sums = new Map<string, number>()
  const counts = new Map<string, number>()
  let maxN = 0

  for (const submission of submissions) {
    maxN = Math.max(maxN, submission.order.length)
    submission.order.forEach((contestantId, position) => {
      const rank = position + 1
      sums.set(contestantId, (sums.get(contestantId) ?? 0) + rank)
      counts.set(contestantId, (counts.get(contestantId) ?? 0) + 1)
    })
  }

  const scores = new Map<string, number>()
  for (const [contestantId, sum] of sums) {
    const meanRank = sum / (counts.get(contestantId) ?? 1)
    scores.set(contestantId, maxN + 1 - meanRank)
  }

  return scores
}

/**
 * Aggregate fan submissions into a ranked, scored list.
 *
 * @param submissions one ordered ranking per fan
 * @param strategy    scoring strategy (default: Borda points)
 * @returns contestants ordered by score desc, with 1-indexed `rank`
 */
export function aggregate(
  submissions: RankingSubmission[],
  strategy: AggregateStrategy = bordaStrategy,
): AggregateResult[] {
  const scores = strategy(submissions)

  return [...scores.entries()]
    .map(([contestantId, score]) => ({ contestantId, score }))
    .sort((a, b) => b.score - a.score || a.contestantId.localeCompare(b.contestantId))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}
