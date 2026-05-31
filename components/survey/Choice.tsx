"use client";

// Single- and multi-choice inputs (issue #41).
//
// Two thin wrappers over native inputs (Base UI's Radio/Checkbox add markup
// these inputs don't need yet). Both maintain controlled state; the parent
// owns answers.

type SingleProps = {
  name: string;
  options: readonly string[];
  value: string | null;
  onChange: (next: string) => void;
};

export function SingleChoice({ name, options, value, onChange }: SingleProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const selected = option === value;
        return (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
              selected
                ? "border-sky-400 bg-sky-500/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="h-4 w-4 accent-sky-400"
            />
            <span className="text-sm font-medium text-neutral-100">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

type MultiProps = {
  name: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
};

export function MultipleChoice({ name, options, value, onChange }: MultiProps) {
  const set = new Set(value);
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const selected = set.has(option);
        return (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
              selected
                ? "border-sky-400 bg-sky-500/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selected}
              onChange={() => {
                const next = new Set(set);
                if (next.has(option)) next.delete(option);
                else next.add(option);
                // Preserve original option order so the answer is stable across renders.
                onChange(options.filter((o) => next.has(o)));
              }}
              className="h-4 w-4 accent-sky-400"
            />
            <span className="text-sm font-medium text-neutral-100">{option}</span>
          </label>
        );
      })}
    </div>
  );
}
