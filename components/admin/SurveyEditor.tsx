"use client";

// Admin survey detail / editor (issue #44).
//
// One client component handles all 4 statuses — the UI swaps per status:
//   draft              — full editor (meta + questions + Publish)
//   active             — title-only edit + public link + Close
//   closed             — response counts + Publish results
//   results_published  — read-only (data already visible to users via /survey)

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuestionEditor, type DraftQuestion } from "./QuestionEditor";
import {
  addQuestion,
  closeSurvey,
  publishResults,
  publishSurvey,
  removeQuestion,
  reorderQuestions,
  updateQuestion,
  updateSurveyMeta,
  type QuestionType,
  type SurveyStatus,
} from "@/lib/admin/surveys";

export type AdminSurveyDetail = {
  id: string;
  title: string;
  weekNumber: number;
  status: SurveyStatus;
  closesAt: string | null;
  publishedAt: string | null;
  resultsPublishedAt: string | null;
  questions: AdminQuestion[];
  responseCount: number;
  anotherActive: boolean;
};

export type AdminQuestion = {
  id: string;
  text: string;
  type: QuestionType;
  displayOrder: number;
  options: string[] | null;
  usesContestants: boolean;
};

const TYPE_LABELS: Record<QuestionType, string> = {
  ranking: "Ranking",
  single_choice: "Single choice",
  multiple_choice: "Multiple choice",
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

export function SurveyEditor({ survey }: { survey: AdminSurveyDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Meta (title + closes_at) — saved on demand.
  const [title, setTitle] = useState(survey.title);
  const [weekNumber, setWeekNumber] = useState(survey.weekNumber);
  const [closesAtLocal, setClosesAtLocal] = useState(
    survey.closesAt ? toLocalInput(survey.closesAt) : "",
  );

  // Question editing state — null when no editor is open; "new" for adding.
  const [editing, setEditing] = useState<"new" | { id: string } | null>(null);

  const metaDirty =
    title !== survey.title ||
    weekNumber !== survey.weekNumber ||
    closesAtLocal !== (survey.closesAt ? toLocalInput(survey.closesAt) : "");

  const isDraft = survey.status === "draft";
  const isActive = survey.status === "active";
  const isClosed = survey.status === "closed";

  return (
    <div>
      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[survey.status]}`}
          >
            {STATUS_LABELS[survey.status]}
          </span>
          <p className="mt-1 text-xs text-neutral-500">
            {survey.publishedAt && `Published ${new Date(survey.publishedAt).toLocaleString()}`}
            {survey.resultsPublishedAt &&
              ` · Results ${new Date(survey.resultsPublishedAt).toLocaleString()}`}
          </p>
        </div>
        {survey.status !== "draft" && (
          <div className="text-right text-sm">
            <p className="text-neutral-400">
              <span className="font-bold tabular-nums text-neutral-100">
                {survey.responseCount}
              </span>{" "}
              {survey.responseCount === 1 ? "response" : "responses"}
            </p>
            <CopyPublicLinkButton surveyId={survey.id} />
          </div>
        )}
      </div>

      {/* ── Meta ────────────────────────────────────────── */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_1fr]">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-neutral-400">
              Title
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!isDraft && !isActive}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-neutral-400">
              Week
            </span>
            <input
              type="number"
              min={1}
              value={weekNumber}
              onChange={(event) => setWeekNumber(Number(event.target.value))}
              disabled={!isDraft}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-neutral-400">
              Closes at (optional)
            </span>
            <input
              type="datetime-local"
              value={closesAtLocal}
              onChange={(event) => setClosesAtLocal(event.target.value)}
              disabled={!isDraft && !isActive}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
            />
          </label>
        </div>
        {(isDraft || isActive) && (
          <div className="mt-3 flex items-center justify-end">
            <button
              type="button"
              disabled={pending || !metaDirty}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const result = await updateSurveyMeta(survey.id, {
                    title,
                    week_number: isDraft ? weekNumber : undefined,
                    closes_at: closesAtLocal ? new Date(closesAtLocal).toISOString() : null,
                  });
                  if (!result.ok) setError(result.error);
                })
              }
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
            >
              Save changes
            </button>
          </div>
        )}
      </section>

      {/* ── Questions ───────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
            Questions
          </h2>
          {isDraft && editing === null && (
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-white/[0.08]"
            >
              + Add question
            </button>
          )}
        </div>

        {survey.questions.length === 0 && editing !== "new" && (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-neutral-400">
            No questions yet — add one to get started.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {survey.questions.map((question, index) => {
            const isEditingThis =
              editing && editing !== "new" && editing.id === question.id;
            return (
              <li
                key={question.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                {isEditingThis ? (
                  <QuestionEditor
                    initial={{
                      id: question.id,
                      text: question.text,
                      type: question.type,
                      options: question.options,
                      usesContestants: question.usesContestants,
                    }}
                    onCancel={() => setEditing(null)}
                    onSave={(draft) => {
                      startTransition(async () => {
                        setError(null);
                        const result = await updateQuestion(survey.id, question.id, {
                          text: draft.text,
                          type: draft.type,
                          options: draft.options,
                          uses_contestants: draft.usesContestants,
                        });
                        if (result.ok) setEditing(null);
                        else setError(result.error);
                      });
                    }}
                    saving={pending}
                  />
                ) : (
                  <div className="grid grid-cols-[24px_1fr_auto] items-center gap-3">
                    <span className="text-xs font-bold tabular-nums text-neutral-500">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="text-sm font-medium text-neutral-100">
                        {question.text}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {TYPE_LABELS[question.type]}
                        {question.usesContestants && " · uses contestants"}
                        {!question.usesContestants &&
                          question.options &&
                          ` · ${question.options.length} options`}
                      </p>
                    </div>
                    {isDraft && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={pending || index === 0}
                          onClick={() => {
                            const next = survey.questions.map((q) => q.id);
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            startTransition(async () => {
                              await reorderQuestions(survey.id, next);
                              router.refresh();
                            });
                          }}
                          aria-label="Move up"
                          className="grid h-7 w-7 place-items-center rounded text-neutral-400 hover:bg-white/[0.05] disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={pending || index === survey.questions.length - 1}
                          onClick={() => {
                            const next = survey.questions.map((q) => q.id);
                            [next[index], next[index + 1]] = [next[index + 1], next[index]];
                            startTransition(async () => {
                              await reorderQuestions(survey.id, next);
                              router.refresh();
                            });
                          }}
                          aria-label="Move down"
                          className="grid h-7 w-7 place-items-center rounded text-neutral-400 hover:bg-white/[0.05] disabled:opacity-30"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing({ id: question.id })}
                          className="rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-300 hover:bg-white/[0.05]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => {
                            if (!confirm("Remove this question?")) return;
                            startTransition(async () => {
                              await removeQuestion(survey.id, question.id);
                              router.refresh();
                            });
                          }}
                          className="rounded-md border border-rose-500/30 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {editing === "new" && (
            <li className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <QuestionEditor
                initial={{
                  text: "",
                  type: "single_choice",
                  options: [],
                  usesContestants: false,
                }}
                onCancel={() => setEditing(null)}
                onSave={(draft) => {
                  startTransition(async () => {
                    setError(null);
                    const result = await addQuestion(survey.id, {
                      text: draft.text,
                      type: draft.type,
                      options: draft.options,
                      uses_contestants: draft.usesContestants,
                    });
                    if (result.ok) {
                      setEditing(null);
                      router.refresh();
                    } else setError(result.error);
                  });
                }}
                saving={pending}
              />
            </li>
          )}
        </ul>
      </section>

      {error && (
        <p className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {humanError(error)}
        </p>
      )}

      {/* ── Status actions ──────────────────────────────── */}
      <section className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-xs text-neutral-500">
          {isDraft && "Publish locks questions and notifies subscribers."}
          {isActive && "Closing stops new submissions; results stay private until you publish them."}
          {isClosed && "Publishing results makes them visible to logged-in users + notifies subscribers."}
          {survey.status === "results_published" && "Results are live for logged-in users."}
        </p>
        <StatusActions
          survey={survey}
          pending={pending}
          onAction={(fn) => {
            setError(null);
            startTransition(async () => {
              const result = await fn();
              if (!result.ok) setError(result.error);
            });
          }}
        />
      </section>
    </div>
  );
}

function StatusActions({
  survey,
  pending,
  onAction,
}: {
  survey: AdminSurveyDetail;
  pending: boolean;
  onAction: (fn: () => ReturnType<typeof publishSurvey>) => void;
}) {
  if (survey.status === "draft") {
    const blocked = survey.anotherActive;
    const canPublish = survey.questions.length > 0 && !blocked;
    return (
      <button
        type="button"
        disabled={pending || !canPublish}
        title={
          blocked
            ? "Another survey is already active in this season"
            : survey.questions.length === 0
              ? "Add a question first"
              : undefined
        }
        onClick={() => {
          if (!confirm("Publish this survey? Subscribers will be notified.")) return;
          onAction(() => publishSurvey(survey.id));
        }}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
      >
        Publish
      </button>
    );
  }
  if (survey.status === "active") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Close this survey? No more responses will be accepted.")) return;
          onAction(() => closeSurvey(survey.id));
        }}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold uppercase tracking-wider text-neutral-900 shadow-lg shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-50"
      >
        Close survey
      </button>
    );
  }
  if (survey.status === "closed") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Publish results? They'll appear on /survey + subscribers notified.")) return;
          onAction(() => publishResults(survey.id));
        }}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:opacity-50"
      >
        Publish results
      </button>
    );
  }
  return (
    <Link
      href="/survey"
      className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-white/[0.08]"
    >
      View on /survey →
    </Link>
  );
}

function CopyPublicLinkButton({ surveyId }: { surveyId: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        const url = `${window.location.origin}/survey/${surveyId}/public`;
        void navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="mt-1 text-xs text-sky-300 hover:text-sky-200"
    >
      {copied ? "Copied!" : "Copy public link"}
    </button>
  );
}

function toLocalInput(iso: string): string {
  // <input type="datetime-local"> needs local-time, no timezone, no seconds.
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function humanError(code: string): string {
  switch (code) {
    case "another-survey-already-active":
      return "Another survey is already active in this season. Close it first.";
    case "no-questions":
      return "Add at least one question before publishing.";
    case "questions-locked":
      return "Questions are locked once a survey is published.";
    case "week-locked-when-active":
      return "Week number can't change once the survey is active.";
    case "read-only":
      return "This survey is read-only.";
    default:
      return code;
  }
}
