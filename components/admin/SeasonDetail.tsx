"use client";

// Admin season detail + status-transition console (issue #42).
//
// Edit affordances depend on status:
//   setup / pre_season — name, dates, pricing constants all editable
//   active+           — pricing locked (UI hides edit; DB trigger backstops);
//                       name + dates stay editable for typo fixes
//
// Each forward step in the state machine is a one-button confirmation. The
// terminal step (ended → results_published) calls publishSeasonResults
// which runs the multi-step SQL function in one transaction.

import { useState, useTransition } from "react";
import {
  advanceSeasonStatus,
  publishSeasonResults,
  updateSeasonMeta,
} from "@/lib/admin/seasons";
import { nextSeasonStatus, type SeasonStatus } from "@/lib/admin/season-types";

export type AdminSeason = {
  id: string;
  name: string;
  status: SeasonStatus;
  startDate: string | null;
  endDate: string | null;
  startingBalance: number;
  kConstant: number;
  basePrice: number;
};

const STATUS_LABELS: Record<SeasonStatus, string> = {
  setup: "Setup",
  pre_season: "Pre-season",
  active: "Active",
  ended: "Ended",
  results_published: "Results published",
};

const STATUS_CLASSES: Record<SeasonStatus, string> = {
  setup: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
  pre_season: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  ended: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  results_published: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

const TRANSITION_LABEL: Record<SeasonStatus, { label: string; helpText: string } | null> = {
  setup: {
    label: "Publish to pre-season",
    helpText: "Makes the season visible to users. No trading yet.",
  },
  pre_season: {
    label: "Open trading",
    helpText: "Pricing constants lock permanently after this step.",
  },
  active: {
    label: "End season",
    helpText: "Stops trading. Set winner / runner-up before publishing results.",
  },
  ended: {
    label: "Publish results",
    helpText: "Snapshots final standings + awards top_3 / top_10 badges.",
  },
  results_published: null,
};

type Props = { season: AdminSeason };

export function SeasonDetail({ season }: Props) {
  const [name, setName] = useState(season.name);
  const [startDate, setStartDate] = useState(season.startDate ?? "");
  const [endDate, setEndDate] = useState(season.endDate ?? "");
  const [startingBalance, setStartingBalance] = useState(String(season.startingBalance));
  const [kConstant, setKConstant] = useState(String(season.kConstant));
  const [basePrice, setBasePrice] = useState(String(season.basePrice));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const pricingLocked =
    season.status === "active" || season.status === "ended" || season.status === "results_published";
  const isTerminal = season.status === "results_published";

  const metaDirty =
    name !== season.name ||
    startDate !== (season.startDate ?? "") ||
    endDate !== (season.endDate ?? "") ||
    (!pricingLocked &&
      (Number(startingBalance) !== season.startingBalance ||
        Number(kConstant) !== season.kConstant ||
        Number(basePrice) !== season.basePrice));

  const transition = TRANSITION_LABEL[season.status];

  return (
    <div>
      {/* ── Status header ──────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <span
          className={`inline-block rounded-full border px-3 py-1 text-sm font-semibold ${STATUS_CLASSES[season.status]}`}
        >
          {STATUS_LABELS[season.status]}
        </span>
        {pricingLocked && (
          <span className="text-xs text-neutral-500">
            🔒 Pricing constants locked
          </span>
        )}
      </div>

      {/* ── Meta ──────────────────────────────────────────── */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-neutral-400">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isTerminal}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-neutral-400">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              disabled={isTerminal}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-neutral-400">
              End date
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              disabled={isTerminal}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
            />
          </label>
        </div>
      </section>

      {/* ── Pricing constants ─────────────────────────────── */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
            Pricing constants
          </h2>
          {pricingLocked && (
            <span className="text-xs text-neutral-500">
              Locked when trading opened
            </span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <PricingField
            label="Starting balance ($)"
            value={startingBalance}
            onChange={setStartingBalance}
            locked={pricingLocked}
          />
          <PricingField
            label="K constant"
            value={kConstant}
            onChange={setKConstant}
            locked={pricingLocked}
            step="0.00000001"
          />
          <PricingField
            label="Base price ($)"
            value={basePrice}
            onChange={setBasePrice}
            locked={pricingLocked}
            step="0.0001"
          />
        </div>
      </section>

      {error && (
        <p className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {/* ── Save changes ──────────────────────────────────── */}
      {!isTerminal && (
        <div className="mb-6 flex items-center justify-end">
          <button
            type="button"
            disabled={pending || !metaDirty}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const fields: Parameters<typeof updateSeasonMeta>[1] = {
                  name,
                  start_date: startDate || null,
                  end_date: endDate || null,
                };
                if (!pricingLocked) {
                  fields.starting_balance = Number(startingBalance);
                  fields.k_constant = Number(kConstant);
                  fields.base_price = Number(basePrice);
                }
                const result = await updateSeasonMeta(season.id, fields);
                if (!result.ok) setError(result.error);
              })
            }
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
          >
            Save changes
          </button>
        </div>
      )}

      {/* ── Status transition ─────────────────────────────── */}
      {transition && (
        <section className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-neutral-500">{transition.helpText}</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm(`${transition.label}? This step is forward-only.`)) return;
              startTransition(async () => {
                setError(null);
                const result =
                  season.status === "ended"
                    ? await publishSeasonResults(season.id)
                    : await advanceSeasonStatus(season.id);
                if (!result.ok) setError(result.error);
              });
            }}
            className={`rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 ${
              nextSeasonStatus(season.status) === "active"
                ? "bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-400"
                : nextSeasonStatus(season.status) === "ended"
                  ? "bg-amber-500 text-neutral-900 shadow-amber-500/30 hover:bg-amber-400"
                  : "bg-sky-500 text-white shadow-sky-500/30 hover:bg-sky-400"
            }`}
          >
            {transition.label}
          </button>
        </section>
      )}

      {isTerminal && (
        <section className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-100">
          🏁 This season is complete. Results published — final standings and
          badges are live.
        </section>
      )}
    </div>
  );
}

function PricingField({
  label,
  value,
  onChange,
  locked,
  step,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  locked: boolean;
  step?: string;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs font-semibold text-neutral-400">{label}</span>
      <input
        type="number"
        step={step ?? "0.01"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={locked}
        className={`w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm tabular-nums ${
          locked ? "text-neutral-500" : "text-neutral-100"
        }`}
      />
    </label>
  );
}
