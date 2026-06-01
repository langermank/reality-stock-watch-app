"use client";

// Question editor — inline form for adding or editing a single survey question
// inside the admin survey builder (issue #44).
//
// Three types share most of the form; only the option-list / uses-contestants
// affordances differ. Custom options are a free-text-list editor (add / edit /
// remove); uses_contestants is a toggle that overrides the option list and
// resolves the contestant roster at submission time on /survey.

import { useState } from "react";
import type { QuestionType } from "@/lib/admin/surveys";

export type DraftQuestion = {
  id?: string;
  text: string;
  type: QuestionType;
  options: string[] | null;
  usesContestants: boolean;
};

type Props = {
  initial: DraftQuestion;
  onSave: (draft: DraftQuestion) => void | Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
};

const TYPE_LABELS: Record<QuestionType, string> = {
  ranking: "Ranking",
  single_choice: "Single choice",
  multiple_choice: "Multiple choice",
};

export function QuestionEditor({ initial, onSave, onCancel, saving, error }: Props) {
  const [text, setText] = useState(initial.text);
  const [type, setType] = useState<QuestionType>(initial.type);
  const [usesContestants, setUsesContestants] = useState(initial.usesContestants);
  const [options, setOptions] = useState<string[]>(initial.options ?? []);
  const [newOption, setNewOption] = useState("");

  // multiple_choice has no "use active contestants" shortcut in the original
  // design (the broadcast scrub model assumes contestants enter ranked lists
  // or single picks). Keep the option scoped to the two cases the schema /
  // form already support.
  const canUseContestants = type === "ranking" || type === "single_choice";
  const optionsRequired = !usesContestants && type !== "ranking";
  const dirty =
    text !== initial.text ||
    type !== initial.type ||
    usesContestants !== initial.usesContestants ||
    JSON.stringify(options) !== JSON.stringify(initial.options ?? []);

  const canSave =
    !saving &&
    dirty &&
    text.trim().length > 0 &&
    (usesContestants || options.length >= (optionsRequired ? 2 : 0));

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-neutral-400">
          Question text
        </span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="e.g. Who played the best this week?"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100"
        />
      </label>

      <fieldset className="mt-3">
        <legend className="mb-1 block text-xs font-semibold text-neutral-400">
          Type
        </legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_LABELS) as QuestionType[]).map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold ${
                type === option
                  ? "border-sky-500/40 bg-sky-500/20 text-sky-200"
                  : "border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]"
              }`}
            >
              <input
                type="radio"
                name={`question-type-${initial.id ?? "new"}`}
                value={option}
                checked={type === option}
                onChange={() => {
                  setType(option);
                  // multi_choice has no uses_contestants affordance; clear it
                  // when switching to keep state coherent.
                  if (option === "multiple_choice") setUsesContestants(false);
                }}
                className="sr-only"
              />
              {TYPE_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      {canUseContestants && (
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={usesContestants}
            onChange={(event) => setUsesContestants(event.target.checked)}
            className="h-4 w-4 accent-sky-400"
          />
          <span className="text-neutral-200">
            Use active contestants
            <span className="ml-1 text-xs text-neutral-500">
              (options resolved when the survey loads)
            </span>
          </span>
        </label>
      )}

      {!usesContestants && (
        <div className="mt-3">
          <span className="mb-1 block text-xs font-semibold text-neutral-400">
            Options{optionsRequired ? " (≥2 required)" : " (optional for ranking — leave empty to use no fixed list)"}
          </span>
          <ul className="flex flex-col gap-1.5">
            {options.map((option, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <input
                  value={option}
                  onChange={(event) => {
                    const next = options.slice();
                    next[index] = event.target.value;
                    setOptions(next);
                  }}
                  className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-neutral-100"
                />
                <button
                  type="button"
                  onClick={() => setOptions(options.filter((_, i) => i !== index))}
                  className="rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-400 hover:bg-white/[0.05]"
                  aria-label={`Remove option ${index + 1}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={newOption}
              onChange={(event) => setNewOption(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && newOption.trim()) {
                  event.preventDefault();
                  setOptions([...options, newOption.trim()]);
                  setNewOption("");
                }
              }}
              placeholder="Add an option…"
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-neutral-100"
            />
            <button
              type="button"
              disabled={!newOption.trim()}
              onClick={() => {
                setOptions([...options, newOption.trim()]);
                setNewOption("");
              }}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-white/[0.08] disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-white/[0.08]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() =>
            void onSave({
              id: initial.id,
              text: text.trim(),
              type,
              options: usesContestants || options.length === 0 ? null : options,
              usesContestants,
            })
          }
          className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
        >
          {saving ? "Saving…" : initial.id ? "Save question" : "Add question"}
        </button>
      </div>
    </div>
  );
}
