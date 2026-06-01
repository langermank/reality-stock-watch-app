// Admin survey detail / editor (issue #44). Server shell that loads the
// survey, its questions, response count, and (when results are published) the
// aggregated results — then hands off to the client SurveyEditor.

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { serviceClient } from "@/lib/supabase/service";
import {
  SurveyEditor,
  type AdminQuestion,
  type AdminSurveyDetail,
} from "@/components/admin/SurveyEditor";
import { ResultsView } from "@/components/survey/results/ResultsView";
import { aggregateResponses } from "@/lib/survey/results";
import { loadQuestions } from "@/lib/survey/source";
import type { QuestionType, SurveyStatus } from "@/lib/admin/surveys";

export const dynamic = "force-dynamic";

type SurveyRow = {
  id: string;
  season_id: string;
  title: string;
  week_number: number;
  status: SurveyStatus;
  closes_at: string | null;
  published_at: string | null;
  results_published_at: string | null;
};
type QuestionRow = {
  id: string;
  text: string;
  type: QuestionType;
  display_order: number;
  options: string[] | null;
  uses_contestants: boolean;
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminSurveyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: surveyRow } = await supabase
    .from("surveys")
    .select(
      "id, season_id, title, week_number, status, closes_at, published_at, results_published_at",
    )
    .eq("id", id)
    .maybeSingle();
  const survey = surveyRow as SurveyRow | null;
  if (!survey) notFound();

  const { data: questionRows } = await supabase
    .from("survey_questions")
    .select("id, text, type, display_order, options, uses_contestants")
    .eq("survey_id", survey.id)
    .order("display_order");
  const questions: AdminQuestion[] = ((questionRows as QuestionRow[] | null) ?? []).map(
    (row) => ({
      id: row.id,
      text: row.text,
      type: row.type,
      displayOrder: row.display_order,
      options: row.options,
      usesContestants: row.uses_contestants,
    }),
  );

  const { count: responseCount } = await supabase
    .from("survey_responses")
    .select("id", { count: "exact", head: true })
    .eq("survey_id", survey.id);

  // Check if another survey is already active in this season (blocks publish).
  let anotherActive = false;
  if (survey.status === "draft") {
    const { count } = await supabase
      .from("surveys")
      .select("id", { count: "exact", head: true })
      .eq("season_id", survey.season_id)
      .eq("status", "active");
    anotherActive = (count ?? 0) > 0;
  }

  const detail: AdminSurveyDetail = {
    id: survey.id,
    title: survey.title,
    weekNumber: survey.week_number,
    status: survey.status,
    closesAt: survey.closes_at,
    publishedAt: survey.published_at,
    resultsPublishedAt: survey.results_published_at,
    questions,
    responseCount: responseCount ?? 0,
    anotherActive,
  };

  // Results section (published surveys) — reuses #79 aggregation + chart.
  let resultsBlock: React.ReactNode = null;
  if (survey.status === "results_published") {
    const resolvedQuestions = await loadQuestions(survey.id, survey.season_id, supabase);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allRows } = await (serviceClient.from("survey_responses") as any)
      .select("answers")
      .eq("survey_id", survey.id);
    const answersList = ((allRows as { answers: Record<string, unknown> }[] | null) ?? []).map(
      (row) => row.answers,
    );
    const results = aggregateResponses(resolvedQuestions, answersList);
    resultsBlock = (
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-neutral-400">
          Results
        </h2>
        <ResultsView results={results} />
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <Link
          href="/admin/surveys"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-neutral-300"
        >
          ← Surveys
        </Link>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-100">
          {survey.title}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">Week {survey.week_number}</p>
      </header>
      <SurveyEditor survey={detail} />
      {resultsBlock}
    </div>
  );
}
