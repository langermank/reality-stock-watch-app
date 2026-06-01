// Admin surveys list page (issue #44). Server shell + interactive list client.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SurveyList, type AdminSurveyRow } from "@/components/admin/SurveyList";
import type { SurveyStatus } from "@/lib/admin/surveys";

export const dynamic = "force-dynamic";

type SurveyRow = {
  id: string;
  title: string;
  week_number: number;
  status: SurveyStatus;
  published_at: string | null;
  closes_at: string | null;
};

export default async function AdminSurveysPage() {
  const supabase = await createClient();

  const { data: seasonRow } = await supabase
    .from("seasons")
    .select("id, name")
    .eq("status", "active")
    .maybeSingle();
  const season = seasonRow as { id: string; name: string } | null;

  if (!season) {
    return (
      <Shell title="Surveys">
        <p className="text-sm text-neutral-400">
          No active season. Surveys are scoped to the active season.
        </p>
      </Shell>
    );
  }

  const { data: surveyData } = await supabase
    .from("surveys")
    .select("id, title, week_number, status, published_at, closes_at")
    .eq("season_id", season.id)
    .order("week_number", { ascending: false });
  const surveys = (surveyData as SurveyRow[] | null) ?? [];

  // Per-survey response count. One query per survey is cheap at this scale and
  // keeps the page free of a bespoke RPC; revisit if the count crosses ~50.
  const rows: AdminSurveyRow[] = await Promise.all(
    surveys.map(async (survey) => {
      const { count } = await supabase
        .from("survey_responses")
        .select("id", { count: "exact", head: true })
        .eq("survey_id", survey.id);
      return {
        id: survey.id,
        title: survey.title,
        weekNumber: survey.week_number,
        status: survey.status,
        publishedAt: survey.published_at,
        closesAt: survey.closes_at,
        responseCount: count ?? 0,
      };
    }),
  );

  return (
    <Shell title="Surveys" subtitle={season.name}>
      <SurveyList seasonId={season.id} surveys={rows} />
    </Shell>
  );
}

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <Link
          href="/admin"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-neutral-300"
        >
          ← Admin
        </Link>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-100">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}
