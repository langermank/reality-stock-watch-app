// Survey data loaders (issue #41).
//
// The user-facing survey page is single-route, multi-state. This module
// reduces the active season's surveys + the user's response to a discriminated
// union the page can switch on. Question options for `uses_contestants=true`
// are resolved at READ TIME against the season's active contestants — that
// way the form always reflects the current cast (a contestant evicted between
// survey-open and the user's load is simply absent).

import { createClient } from "@/lib/supabase/server";

export type QuestionType = "ranking" | "multiple_choice" | "single_choice";

export type SurveyQuestion = {
  id: string;
  text: string;
  type: QuestionType;
  displayOrder: number;
  /** Resolved options ready for the form. For uses_contestants=true these
   *  are contestant names from the active roster; otherwise the column's
   *  static options[]. May be empty (e.g. text-only question — not used yet). */
  options: string[];
  usesContestants: boolean;
};

export type SurveyMeta = {
  id: string;
  title: string;
  weekNumber: number;
  status: "draft" | "active" | "closed" | "results_published";
  closesAt: string | null;
};

/** Discriminated union mirroring the 5 states in docs/design/interaction-flow-survey.md. */
export type SurveyPageState =
  | { kind: "no-active" }
  | { kind: "active-not-submitted"; survey: SurveyMeta; questions: SurveyQuestion[] }
  | {
      kind: "active-submitted";
      survey: SurveyMeta;
      questions: SurveyQuestion[];
      answers: Record<string, unknown>;
    }
  | {
      kind: "closed-pending";
      survey: SurveyMeta;
      questions: SurveyQuestion[];
      answers: Record<string, unknown> | null;
    }
  | {
      kind: "results-published";
      survey: SurveyMeta;
      questions: SurveyQuestion[];
      answers: Record<string, unknown> | null;
    };

type SurveyRow = {
  id: string;
  title: string;
  week_number: number;
  status: SurveyMeta["status"];
  closes_at: string | null;
};
type QuestionRow = {
  id: string;
  text: string;
  type: QuestionType;
  display_order: number;
  options: string[] | null;
  uses_contestants: boolean;
};

/**
 * Pick the survey to show on /survey: prefer active, else the most recent
 * closed-but-not-yet-published, else the most recent published. Returns null
 * if the active season has no surveys at all.
 */
async function pickRelevantSurvey(seasonId: string): Promise<SurveyRow | null> {
  const supabase = await createClient();
  const fields = "id, title, week_number, status, closes_at";

  // 1. Active (one at most — enforced by partial unique index).
  const { data: activeRow } = await supabase
    .from("surveys")
    .select(fields)
    .eq("season_id", seasonId)
    .eq("status", "active")
    .maybeSingle();
  if (activeRow) return activeRow as SurveyRow;

  // 2. Most recent closed (results pending publication).
  const { data: closedRows } = await supabase
    .from("surveys")
    .select(fields)
    .eq("season_id", seasonId)
    .eq("status", "closed")
    .order("week_number", { ascending: false })
    .limit(1);
  const closed = (closedRows as SurveyRow[] | null)?.[0];
  if (closed) return closed;

  // 3. Most recent results-published. (The "no active" state intentionally
  //    does NOT surface old results — see design doc decision.)
  const { data: publishedRows } = await supabase
    .from("surveys")
    .select(fields)
    .eq("season_id", seasonId)
    .eq("status", "results_published")
    .order("week_number", { ascending: false })
    .limit(1);
  return ((publishedRows as SurveyRow[] | null)?.[0]) ?? null;
}

async function loadActiveContestantNames(seasonId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contestants")
    .select("name, status")
    .eq("season_id", seasonId)
    .eq("status", "active")
    .order("name");
  return ((data as { name: string }[] | null) ?? []).map((row) => row.name);
}

/** Compute the survey page state for a given user + active season. */
export async function getSurveyPageState(userId: string): Promise<SurveyPageState> {
  const supabase = await createClient();

  const { data: seasonRow } = await supabase
    .from("seasons")
    .select("id")
    .eq("status", "active")
    .maybeSingle();
  const season = seasonRow as { id: string } | null;
  if (!season) return { kind: "no-active" };

  const survey = await pickRelevantSurvey(season.id);
  if (!survey) return { kind: "no-active" };

  // Status determines which state we're in. For active and results_published
  // the RLS policy lets us read questions; for closed/draft we still need
  // them if we already submitted (to render Your Picks), so admin-mode would
  // bypass — but the closed-state user IS the one who submitted, so they
  // already have the answers, and questions are accessible because... actually
  // closed/draft don't satisfy the RLS read policy. Workaround: only fetch
  // questions when status is active or results_published. For closed-pending
  // we render from `answers` alone, treating it as opaque key/value.
  let questions: SurveyQuestion[] = [];
  if (survey.status === "active" || survey.status === "results_published") {
    questions = await loadQuestions(survey.id, season.id);
  }

  // Did this user submit?
  const { data: responseRow } = await supabase
    .from("survey_responses")
    .select("answers")
    .eq("survey_id", survey.id)
    .eq("user_id", userId)
    .maybeSingle();
  const answers = (responseRow as { answers: Record<string, unknown> } | null)?.answers ?? null;

  const meta: SurveyMeta = {
    id: survey.id,
    title: survey.title,
    weekNumber: survey.week_number,
    status: survey.status,
    closesAt: survey.closes_at,
  };

  if (survey.status === "active") {
    return answers
      ? { kind: "active-submitted", survey: meta, questions, answers }
      : { kind: "active-not-submitted", survey: meta, questions };
  }
  if (survey.status === "closed") {
    return { kind: "closed-pending", survey: meta, questions, answers };
  }
  if (survey.status === "results_published") {
    return { kind: "results-published", survey: meta, questions, answers };
  }
  return { kind: "no-active" }; // draft — treat as none
}

/** Load + resolve questions for the survey (used by both logged-in & public routes). */
export async function loadQuestions(
  surveyId: string,
  seasonId: string,
): Promise<SurveyQuestion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("survey_questions")
    .select("id, text, type, display_order, options, uses_contestants")
    .eq("survey_id", surveyId)
    .order("display_order");
  const rows = (data as QuestionRow[] | null) ?? [];
  if (rows.length === 0) return [];

  // Resolve contestant lists once if any question needs them.
  const needsContestants = rows.some((row) => row.uses_contestants);
  const contestants = needsContestants ? await loadActiveContestantNames(seasonId) : [];

  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    type: row.type,
    displayOrder: row.display_order,
    options: row.uses_contestants ? contestants : (row.options ?? []),
    usesContestants: row.uses_contestants,
  }));
}

/** Public-link loader: the survey, its questions, and a closed/active flag.
 *  Surfaces the "closed/published" state separately so the public route can
 *  show "this survey is closed" without exposing user-only views. */
export async function getPublicSurvey(surveyId: string): Promise<
  | { kind: "active"; survey: SurveyMeta; questions: SurveyQuestion[] }
  | { kind: "closed"; survey: SurveyMeta }
  | null
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("surveys")
    .select("id, title, week_number, status, closes_at, season_id")
    .eq("id", surveyId)
    .maybeSingle();
  const row = data as (SurveyRow & { season_id: string }) | null;
  if (!row) return null;

  const meta: SurveyMeta = {
    id: row.id,
    title: row.title,
    weekNumber: row.week_number,
    status: row.status,
    closesAt: row.closes_at,
  };

  if (row.status === "active") {
    const questions = await loadQuestions(row.id, row.season_id);
    return { kind: "active", survey: meta, questions };
  }
  // closed / results_published / draft → all "closed" from anon perspective
  return { kind: "closed", survey: meta };
}
