"use client";

// Admin contestant management table (issue #43).
//
// One row per contestant for the active season. Click a row to expand inline
// for editing — no modal. The collapsed row shows the at-a-glance state
// (photo, name, status, visual flags, supply for monitoring); the expanded
// form lets the admin change name/photo/bio/status and toggle the three
// visual flags. HoH single-occupant enforcement is in the server action.

import { useState, useTransition } from "react";
import {
  setContestantFlag,
  updateContestant,
  type ContestantStatus,
} from "@/lib/admin/contestants";

export type AdminContestant = {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  status: ContestantStatus;
  isHoh: boolean;
  isNominated: boolean;
  hasVeto: boolean;
  totalSharesOutstanding: number;
};

type Props = { contestants: AdminContestant[] };

const STATUS_LABELS: Record<ContestantStatus, string> = {
  active: "Active",
  evicted: "Evicted",
  winner: "Winner",
  runner_up: "Runner-up",
};

const STATUS_CLASSES: Record<ContestantStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  evicted: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  winner: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  runner_up: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

export function ContestantTable({ contestants }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ul className="flex flex-col gap-2">
      {contestants.map((contestant) => {
        const isOpen = expanded === contestant.id;
        return (
          <li
            key={contestant.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
          >
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : contestant.id)}
              className="grid w-full grid-cols-[48px_1fr_auto_auto] items-center gap-4 p-3 text-left hover:bg-white/[0.03]"
            >
              <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-white/10 bg-neutral-900">
                {contestant.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={contestant.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-neutral-500">—</span>
                )}
              </span>
              <span>
                <span className="block text-base font-semibold text-neutral-100">
                  {contestant.name}
                </span>
                <span className="mt-0.5 flex flex-wrap gap-1.5 text-xs">
                  {contestant.isHoh && (
                    <Badge color="bg-amber-500/20 text-amber-200 border-amber-500/30">
                      👑 HoH
                    </Badge>
                  )}
                  {contestant.isNominated && (
                    <Badge color="bg-rose-500/20 text-rose-200 border-rose-500/30">
                      🎯 Nominated
                    </Badge>
                  )}
                  {contestant.hasVeto && (
                    <Badge color="bg-violet-500/20 text-violet-200 border-violet-500/30">
                      🛡 Veto
                    </Badge>
                  )}
                </span>
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[contestant.status]}`}
              >
                {STATUS_LABELS[contestant.status]}
              </span>
              <span className="hidden text-right text-xs text-neutral-500 sm:block">
                <span className="tabular-nums">
                  {Math.round(contestant.totalSharesOutstanding)}
                </span>{" "}
                shares
              </span>
            </button>
            {isOpen && (
              <ContestantEditForm
                contestant={contestant}
                onClose={() => setExpanded(null)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 ${color}`}>{children}</span>
  );
}

function ContestantEditForm({
  contestant,
  onClose,
}: {
  contestant: AdminContestant;
  onClose: () => void;
}) {
  const [name, setName] = useState(contestant.name);
  const [photoUrl, setPhotoUrl] = useState(contestant.photoUrl ?? "");
  const [bio, setBio] = useState(contestant.bio ?? "");
  const [status, setStatus] = useState<ContestantStatus>(contestant.status);
  const [error, setError] = useState<string | null>(null);
  const [savingPending, startSaving] = useTransition();
  const [flagPending, startFlag] = useTransition();

  const dirty =
    name !== contestant.name ||
    photoUrl !== (contestant.photoUrl ?? "") ||
    bio !== (contestant.bio ?? "") ||
    status !== contestant.status;

  return (
    <div className="border-t border-white/10 bg-black/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-neutral-400">
            Name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-neutral-400">
            Photo URL
          </span>
          <input
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
            placeholder="https://…"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-neutral-400">
            Bio
          </span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100"
          />
        </label>
        <fieldset className="text-sm sm:col-span-2">
          <legend className="mb-1 block text-xs font-semibold text-neutral-400">
            Status
          </legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as ContestantStatus[]).map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold ${
                  status === option
                    ? STATUS_CLASSES[option]
                    : "border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]"
                }`}
              >
                <input
                  type="radio"
                  name={`status-${contestant.id}`}
                  value={option}
                  checked={status === option}
                  onChange={() => setStatus(option)}
                  className="sr-only"
                />
                {STATUS_LABELS[option]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="text-sm sm:col-span-2">
          <legend className="mb-1 block text-xs font-semibold text-neutral-400">
            Visual flags
          </legend>
          <div className="flex flex-wrap gap-2">
            <FlagToggle
              label="👑 HoH"
              active={contestant.isHoh}
              disabled={flagPending}
              onToggle={(value) => {
                startFlag(async () => {
                  const result = await setContestantFlag(contestant.id, "is_hoh", value);
                  if (!result.ok) setError(result.error);
                });
              }}
            />
            <FlagToggle
              label="🎯 Nominated"
              active={contestant.isNominated}
              disabled={flagPending}
              onToggle={(value) => {
                startFlag(async () => {
                  const result = await setContestantFlag(
                    contestant.id,
                    "is_nominated",
                    value,
                  );
                  if (!result.ok) setError(result.error);
                });
              }}
            />
            <FlagToggle
              label="🛡 Veto"
              active={contestant.hasVeto}
              disabled={flagPending}
              onToggle={(value) => {
                startFlag(async () => {
                  const result = await setContestantFlag(contestant.id, "has_veto", value);
                  if (!result.ok) setError(result.error);
                });
              }}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            HoH is single-occupant — toggling it on for this contestant clears it
            elsewhere in the same season.
          </p>
        </fieldset>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-white/[0.08]"
        >
          Close
        </button>
        <button
          type="button"
          disabled={savingPending || !dirty}
          onClick={() => {
            setError(null);
            startSaving(async () => {
              const result = await updateContestant(contestant.id, {
                name,
                photo_url: photoUrl.trim() ? photoUrl.trim() : null,
                bio: bio.trim() ? bio.trim() : null,
                status,
              });
              if (!result.ok) setError(result.error);
            });
          }}
          className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
        >
          {savingPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function FlagToggle({
  label,
  active,
  disabled,
  onToggle,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(!active)}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${
        active
          ? "border-amber-500/30 bg-amber-500/20 text-amber-200"
          : "border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]"
      }`}
    >
      {label}
    </button>
  );
}
