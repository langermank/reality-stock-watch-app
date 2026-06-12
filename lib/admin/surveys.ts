"use server";

// Admin survey CRUD + state-machine actions (issue #44).
//
// Status state machine (each transition is a deliberate admin action):
//
//   draft ──publishSurvey──▶ active ──closeSurvey──▶ closed ──publishResults──▶ results_published
//
// Invariants enforced here:
//   - One active survey per season at a time. publishSurvey refuses if another
//     is already active. (Also enforced by a partial unique index in the DB.)
//   - publishSurvey requires ≥1 question.
//   - Active surveys: only `title` and `closes_at` are mutable (questions
//     locked to protect response integrity).
//   - Closed / results_published surveys: read-only.
//
// Push notifications fire on publishSurvey + publishResults. Best-effort —
// a failed notification doesn't roll back the status change.

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { sendToAll } from "@/lib/push";

import type { QuestionType, SurveyStatus } from "@/lib/supabase/types";

export type { QuestionType, SurveyStatus };

export type ActionFailure = { ok: false; error: string };
export type ActionResult<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | ActionFailure;

type SurveyRow = {
  id: string;
  status: SurveyStatus;
  season_id: string;
  title: string;
};

async function loadSurvey(id: string): Promise<SurveyRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("surveys")
    .select("id, status, season_id, title")
    .eq("id", id)
    .maybeSingle();
  return data;
}

// ─────────────────────────────────────────────────────────────────────────
// Draft creation + edits
// ─────────────────────────────────────────────────────────────────────────

export async function createDraft(
  seasonId: string,
  weekNumber: number,
): Promise<ActionResult<{ id: string }>> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const supabase = await createClient();
  const { data, error } = await supabase.from("surveys")
    .insert({
      season_id: seasonId,
      week_number: weekNumber,
      title: `Week ${weekNumber} survey`,
      status: "draft",
    })
    .select("id")
    .single();
  if (error || !data?.id) return { ok: false, error: error?.message ?? "unknown" };
  revalidatePath("/admin/surveys");
  return { ok: true, data: { id: data.id } };
}

export async function updateSurveyMeta(
  id: string,
  fields: { title?: string; week_number?: number; closes_at?: string | null },
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const survey = await loadSurvey(id);
  if (!survey) return { ok: false, error: "not-found" };
  if (survey.status === "closed" || survey.status === "results_published") {
    return { ok: false, error: "read-only" };
  }
  if (survey.status === "active" && fields.week_number !== undefined) {
    return { ok: false, error: "week-locked-when-active" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("surveys").update(fields).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/surveys");
  revalidatePath(`/admin/surveys/${id}`);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────
// Questions
// ─────────────────────────────────────────────────────────────────────────

function assertDraft(survey: SurveyRow): ActionFailure | null {
  if (survey.status !== "draft") return { ok: false, error: "questions-locked" };
  return null;
}

export async function addQuestion(
  surveyId: string,
  input: {
    text: string;
    type: QuestionType;
    options: string[] | null;
    uses_contestants: boolean;
  },
): Promise<ActionResult<{ id: string }>> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const survey = await loadSurvey(surveyId);
  if (!survey) return { ok: false, error: "not-found" };
  const guard = assertDraft(survey);
  if (guard) return guard;

  const supabase = await createClient();
  // Next display_order = current count.
  const { count } = await supabase.from("survey_questions")
    .select("id", { count: "exact", head: true })
    .eq("survey_id", surveyId);
  const nextOrder = (count ?? 0) + 1;

  const { data, error } = await supabase.from("survey_questions")
    .insert({
      survey_id: surveyId,
      text: input.text,
      type: input.type,
      display_order: nextOrder,
      options: input.options,
      uses_contestants: input.uses_contestants,
    })
    .select("id")
    .single();
  if (error || !data?.id) return { ok: false, error: error?.message ?? "unknown" };
  revalidatePath(`/admin/surveys/${surveyId}`);
  return { ok: true, data: { id: data.id } };
}

export async function updateQuestion(
  surveyId: string,
  questionId: string,
  fields: {
    text?: string;
    type?: QuestionType;
    options?: string[] | null;
    uses_contestants?: boolean;
  },
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const survey = await loadSurvey(surveyId);
  if (!survey) return { ok: false, error: "not-found" };
  const guard = assertDraft(survey);
  if (guard) return guard;

  const supabase = await createClient();
  const { error } = await supabase.from("survey_questions")
    .update(fields)
    .eq("id", questionId)
    .eq("survey_id", surveyId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/surveys/${surveyId}`);
  return { ok: true };
}

export async function removeQuestion(
  surveyId: string,
  questionId: string,
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const survey = await loadSurvey(surveyId);
  if (!survey) return { ok: false, error: "not-found" };
  const guard = assertDraft(survey);
  if (guard) return guard;

  const supabase = await createClient();
  const { error } = await supabase.from("survey_questions")
    .delete()
    .eq("id", questionId)
    .eq("survey_id", surveyId);
  if (error) return { ok: false, error: error.message };
  // Compact display_order so deletes don't leave holes — keeps reorder simple.
  await compactDisplayOrder(surveyId);
  revalidatePath(`/admin/surveys/${surveyId}`);
  return { ok: true };
}

export async function reorderQuestions(
  surveyId: string,
  idsInOrder: string[],
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const survey = await loadSurvey(surveyId);
  if (!survey) return { ok: false, error: "not-found" };
  const guard = assertDraft(survey);
  if (guard) return guard;

  const supabase = await createClient();
  // Bulk update one at a time — small N (handful of questions), keeps it simple.
  for (let i = 0; i < idsInOrder.length; i += 1) {
    const { error } = await supabase.from("survey_questions")
      .update({ display_order: i + 1 })
      .eq("id", idsInOrder[i])
      .eq("survey_id", surveyId);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/admin/surveys/${surveyId}`);
  return { ok: true };
}

async function compactDisplayOrder(surveyId: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase.from("survey_questions")
    .select("id, display_order")
    .eq("survey_id", surveyId)
    .order("display_order");
  const rows = data ?? [];
  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i].display_order === i + 1) continue;
    await supabase.from("survey_questions")
      .update({ display_order: i + 1 })
      .eq("id", rows[i].id);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Status transitions
// ─────────────────────────────────────────────────────────────────────────

export async function publishSurvey(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const survey = await loadSurvey(id);
  if (!survey) return { ok: false, error: "not-found" };
  if (survey.status !== "draft") return { ok: false, error: "not-draft" };

  const supabase = await createClient();

  // Block if another survey is already active in this season.
  const { count: activeCount } = await supabase.from("surveys")
    .select("id", { count: "exact", head: true })
    .eq("season_id", survey.season_id)
    .eq("status", "active");
  if ((activeCount ?? 0) > 0) {
    return { ok: false, error: "another-survey-already-active" };
  }

  // Require ≥1 question.
  const { count: questionCount } = await supabase.from("survey_questions")
    .select("id", { count: "exact", head: true })
    .eq("survey_id", id);
  if ((questionCount ?? 0) === 0) {
    return { ok: false, error: "no-questions" };
  }

  const { error } = await supabase.from("surveys")
    .update({ status: "active", published_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Best-effort push notification.
  void sendToAll({
    title: "New survey available",
    body: survey.title,
    url: "/survey",
  }).catch(() => {});

  revalidatePath("/admin/surveys");
  revalidatePath(`/admin/surveys/${id}`);
  return { ok: true };
}

export async function closeSurvey(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const survey = await loadSurvey(id);
  if (!survey) return { ok: false, error: "not-found" };
  if (survey.status !== "active") return { ok: false, error: "not-active" };

  const supabase = await createClient();
  const { error } = await supabase.from("surveys")
    .update({ status: "closed" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/surveys");
  revalidatePath(`/admin/surveys/${id}`);
  return { ok: true };
}

export async function publishResults(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "not-authorized" };
  const survey = await loadSurvey(id);
  if (!survey) return { ok: false, error: "not-found" };
  if (survey.status !== "closed") return { ok: false, error: "not-closed" };

  const supabase = await createClient();
  const { error } = await supabase.from("surveys")
    .update({
      status: "results_published",
      results_published_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Best-effort push notification.
  void sendToAll({
    title: "Survey results are in",
    body: survey.title,
    url: "/survey",
  }).catch(() => {});

  revalidatePath("/admin/surveys");
  revalidatePath(`/admin/surveys/${id}`);
  return { ok: true };
}
