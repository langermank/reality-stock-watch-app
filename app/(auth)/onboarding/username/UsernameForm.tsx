"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { USERNAME_RULES, validateUsernameFormat } from "@/lib/username";

type CheckState = "idle" | "checking" | "available" | "taken";

function saveUsername(username: string): Promise<{ error?: string }> {
  return fetch("/api/username/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  }).then((r) => r.json());
}

export function UsernameForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const format = validateUsernameFormat(value);
  const formatOk = format.ok;

  // Inline error: format errors shown after first keystroke, availability after check
  let inlineError = "";
  if (touched && !formatOk) inlineError = (format as { ok: false; error: string }).error;
  if (touched && formatOk && checkState === "taken") inlineError = "Username is already taken";
  if (submitError) inlineError = submitError;

  const isValid = formatOk && checkState === "available";

  // Debounced availability check
  useEffect(() => {
    if (!formatOk) {
      setCheckState("idle");
      return;
    }
    setCheckState("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/username/check?username=${encodeURIComponent(value)}`);
      const { available } = await res.json();
      setCheckState(available ? "available" : "taken");
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, formatOk]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTouched(true);
    setSubmitError("");
    setValue(e.target.value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    startTransition(async () => {
      const result = await saveUsername(value);
      if (result.error) {
        setSubmitError(result.error);
      } else {
        router.push("/market");
      }
    });
  }

  // Input border + indicator
  const borderClass =
    !touched || value === ""
      ? "border-neutral-700 focus-within:border-neutral-400"
      : inlineError
        ? "border-red-500"
        : checkState === "available"
          ? "border-green-500"
          : "border-neutral-700 focus-within:border-neutral-400";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="username" className="text-sm font-medium text-neutral-300">
            Username
          </label>
          <span className="text-xs text-neutral-500">
            {value.length}/20
          </span>
        </div>

        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 bg-neutral-900 transition-colors ${borderClass}`}>
          <span className="text-neutral-500 text-sm select-none">@</span>
          <input
            id="username"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={20}
            value={value}
            onChange={handleChange}
            placeholder="yourname"
            className="flex-1 bg-transparent text-sm text-neutral-50 placeholder:text-neutral-600 outline-none"
          />
          {/* State indicator */}
          {touched && value !== "" && (
            checkState === "checking" ? (
              <span className="text-neutral-500 text-xs">…</span>
            ) : checkState === "available" ? (
              <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null
          )}
        </div>

        {/* Inline error */}
        {inlineError && (
          <p className="text-xs text-red-400">{inlineError}</p>
        )}
      </div>

      {/* Requirements checklist */}
      <ul className="flex flex-col gap-1.5">
        {USERNAME_RULES.map((rule) => {
          const pass = rule.pass(value);
          const show = touched && value !== "";
          return (
            <li key={rule.label} className="flex items-center gap-2 text-xs">
              <span className={`shrink-0 ${show ? (pass ? "text-green-500" : "text-red-400") : "text-neutral-600"}`}>
                {show ? (pass ? "✓" : "✗") : "·"}
              </span>
              <span className={show ? (pass ? "text-neutral-400" : "text-neutral-300") : "text-neutral-500"}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || isPending}
        className="w-full rounded-lg bg-white text-neutral-950 px-8 py-3 text-sm font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
