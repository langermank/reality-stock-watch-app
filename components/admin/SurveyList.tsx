"use client";

// Admin survey list (issue #44).
//
// Status-colored badge per row; click navigates to the editor/detail. The
// "Create draft" button picks a sensible next week_number (max + 1) so the
// admin doesn't have to think about it; it's editable on the next page.

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createDraft, type SurveyStatus } from "@/lib/admin/surveys";

export type AdminSurveyRow = {
  id: string;
  title: string;
  weekNumber: number;
  status: SurveyStatus;
  publishedAt: string | null;
  closesAt: string | null;
  responseCount: number;
};

type Props = {
  seasonId: string;
  surveys: AdminSurveyRow[];
};

const STATUS_LABELS: Record<SurveyStatus, string> = {
  draft: "Draft",
  active: "Active",
  closed: "Closed",
  results_published: "Results published",
};

const STATUS_CLASSES: Record<SurveyStatus, string> = {
  draft: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  closed: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  results_published: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

export function SurveyList({ seasonId, surveys }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const nextWeek = Math.max(...surveys.map((s) => s.weekNumber), 0) + 1;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          {surveys.length} {surveys.length === 1 ? "survey" : "surveys"}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await createDraft(seasonId, nextWeek);
              if (result.ok) router.push(`/admin/surveys/${result.data.id}`);
            });
          }}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:opacity-50"
        >
          {pending ? "Creating…" : `+ New draft (week ${nextWeek})`}
        </button>
      </div>

      {surveys.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-neutral-400">
          No surveys yet for this season.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {surveys.map((survey) => (
            <li
              key={survey.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
            >
              <Link
                href={`/admin/surveys/${survey.id}`}
                className="grid grid-cols-[60px_1fr_auto_auto] items-center gap-4 p-4"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  WK {survey.weekNumber}
                </span>
                <span>
                  <span className="block text-base font-semibold text-neutral-100">
                    {survey.title}
                  </span>
                  {survey.status === "active" && survey.closesAt && (
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      Closes {new Date(survey.closesAt).toLocaleString()}
                    </span>
                  )}
                </span>
                <span className="text-right text-xs text-neutral-500">
                  {survey.responseCount}{" "}
                  {survey.responseCount === 1 ? "response" : "responses"}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[survey.status]}`}
                >
                  {STATUS_LABELS[survey.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
