"use client";

// Drag-to-reorder ranking input (issue #41).
//
// HTML5 native DnD — no external library. Each row is draggable; dragover on
// another row swaps positions in the controlled `value` array. Touch users
// get the up/down buttons as a fallback path (touch HTML5 DnD is unreliable).
//
// `value` is an array of option strings in submitted-rank order (best first).
// On change we hand the parent the same shape.

import { useState } from "react";

type Props = {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  /** id for label association — questions share names across the form */
  id?: string;
};

function move<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function Ranking({ options, value, onChange, id }: Props) {
  // Initialize ranks from `value`; fall back to option order. Stay in sync if
  // upstream `value` ever resets (e.g. after submit).
  const ordered = value.length === options.length ? value : [...options];
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  return (
    <ol
      id={id}
      className="flex flex-col gap-2"
      aria-label="Drag to reorder, top is best"
    >
      {ordered.map((option, index) => (
        <li
          key={option}
          draggable
          onDragStart={(event) => {
            setDraggingIndex(index);
            event.dataTransfer.effectAllowed = "move";
            // Firefox needs data on the drag event to actually fire dragover.
            event.dataTransfer.setData("text/plain", String(index));
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (draggingIndex === null || draggingIndex === index) return;
            onChange(move(ordered, draggingIndex, index));
            setDraggingIndex(index);
          }}
          onDragEnd={() => setDraggingIndex(null)}
          className={`group flex items-center gap-3 rounded-lg border bg-white/[0.02] p-3 transition ${
            draggingIndex === index
              ? "border-sky-400 bg-sky-500/10"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 place-items-center rounded text-xs font-bold text-neutral-400"
          >
            {index + 1}
          </span>
          <span className="flex-1 text-sm font-medium text-neutral-100">{option}</span>
          {/* Touch / no-DnD fallback. Hidden on hover devices to keep the row clean. */}
          <span className="flex gap-1">
            <button
              type="button"
              aria-label={`Move ${option} up`}
              onClick={() => onChange(move(ordered, index, index - 1))}
              disabled={index === 0}
              className="grid h-7 w-7 place-items-center rounded text-neutral-400 hover:bg-white/10 disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              aria-label={`Move ${option} down`}
              onClick={() => onChange(move(ordered, index, index + 1))}
              disabled={index === ordered.length - 1}
              className="grid h-7 w-7 place-items-center rounded text-neutral-400 hover:bg-white/10 disabled:opacity-30"
            >
              ▼
            </button>
            <span
              aria-hidden="true"
              className="grid h-7 w-7 place-items-center text-neutral-500 cursor-grab active:cursor-grabbing"
              title="Drag"
            >
              ⋮⋮
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
