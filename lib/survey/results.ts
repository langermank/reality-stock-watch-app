// Survey results aggregation (issue #79).
//
// The seam between raw `survey_responses` rows and the results chart shown
// in state 5 of /survey. The chart consumes pre-aggregated shapes; this
// module is the only place that knows how answers are stored. When real fan
// responses start flowing (after #44 ships the survey builder + #41's anon
// submit), the aggregation layer is unchanged — only the row count grows.
//
// Answer storage shape (matches the form output in components/survey/SurveyForm
// and the seed):
//   single_choice  → answers[questionId] = "<option>"
//   multiple_choice → answers[questionId] = ["<opt>", ...]
//   ranking        → answers[questionId] = ["<option>", ...] best-first
//
// For ranking we reuse Borda from lib/reveal/aggregate.ts so all reveal-
// adjacent math has one home.

import { bordaStrategy } from "@/lib/reveal/aggregate";
import type { SurveyQuestion } from "./source";

export type ChoiceBucket = {
  option: string;
  count: number;
  /** % of total responses for this question. */
  share: number;
};

export type RankingBucket = {
  option: string;
  /** Borda points (higher = better). */
  score: number;
  /** 1-indexed rank by score. */
  rank: number;
  /** Average submitted position (1-indexed). */
  averagePosition: number;
  /** Number of submissions that included this contestant. */
  appearances: number;
};

export type QuestionResults =
  | { type: "single_choice"; question: SurveyQuestion; responses: number; buckets: ChoiceBucket[] }
  | { type: "multiple_choice"; question: SurveyQuestion; responses: number; buckets: ChoiceBucket[] }
  | { type: "ranking"; question: SurveyQuestion; responses: number; buckets: RankingBucket[] };

type AnswersMap = Record<string, unknown>;

/**
 * Aggregate a batch of `survey_responses.answers` into per-question results.
 * Pure: no DB access, no side effects. Pass the canonical question list (so
 * we know the type + option set) plus the array of answers blobs.
 */
export function aggregateResponses(
  questions: SurveyQuestion[],
  answersList: AnswersMap[],
): QuestionResults[] {
  return questions.map((question) => aggregateOne(question, answersList));
}

function aggregateOne(question: SurveyQuestion, answersList: AnswersMap[]): QuestionResults {
  if (question.type === "ranking") {
    return aggregateRanking(question, answersList);
  }
  return aggregateChoice(question, answersList);
}

function aggregateChoice(
  question: SurveyQuestion,
  answersList: AnswersMap[],
): QuestionResults {
  const counts = new Map<string, number>();
  // Pre-seed every known option to 0 so the chart can show every choice even
  // if some got no votes.
  for (const option of question.options) counts.set(option, 0);

  let responseCount = 0;
  for (const answers of answersList) {
    const raw = answers[question.id];
    if (raw === undefined || raw === null) continue;
    responseCount += 1;
    if (Array.isArray(raw)) {
      // multiple_choice — each selected option contributes one.
      for (const item of raw) {
        if (typeof item === "string") {
          counts.set(item, (counts.get(item) ?? 0) + 1);
        }
      }
    } else if (typeof raw === "string") {
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
    }
  }

  // For single_choice the denominator is response count.
  // For multiple_choice each respondent contributes N picks; share is still
  // relative to response count (so 100% means everyone picked this option),
  // which is the convention the chart wants.
  const buckets: ChoiceBucket[] = [...counts.entries()]
    .map(([option, count]) => ({
      option,
      count,
      share: responseCount > 0 ? count / responseCount : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    type: question.type as "single_choice" | "multiple_choice",
    question,
    responses: responseCount,
    buckets,
  };
}

function aggregateRanking(
  question: SurveyQuestion,
  answersList: AnswersMap[],
): QuestionResults {
  // Pull out valid ranking arrays and feed them into Borda.
  const submissions: { order: string[] }[] = [];
  for (const answers of answersList) {
    const raw = answers[question.id];
    if (!Array.isArray(raw)) continue;
    const order = raw.filter((item): item is string => typeof item === "string");
    if (order.length > 0) submissions.push({ order });
  }

  const responses = submissions.length;
  if (responses === 0) {
    return { type: "ranking", question, responses, buckets: [] };
  }

  // Borda scores.
  const bordaScores = bordaStrategy(submissions);
  // Average position + appearance count — companion stats Borda alone doesn't tell.
  const positionTotals = new Map<string, number>();
  const appearances = new Map<string, number>();
  for (const { order } of submissions) {
    order.forEach((option, index) => {
      positionTotals.set(option, (positionTotals.get(option) ?? 0) + (index + 1));
      appearances.set(option, (appearances.get(option) ?? 0) + 1);
    });
  }

  const buckets: RankingBucket[] = [...bordaScores.entries()]
    .map(([option, score]) => {
      const seen = appearances.get(option) ?? 0;
      const positionSum = positionTotals.get(option) ?? 0;
      return {
        option,
        score,
        rank: 0, // assigned below after sort
        averagePosition: seen > 0 ? positionSum / seen : 0,
        appearances: seen,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((bucket, index) => ({ ...bucket, rank: index + 1 }));

  return { type: "ranking", question, responses, buckets };
}
