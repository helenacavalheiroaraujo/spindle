"use client";
// The four condition grades as radio cards, shared by the sell form and the edit in My listings (bug 10).
// The grades come from lib/rules/sellForm; this only shows them. `name` keeps radio groups apart on one page.
import { CONDITIONS } from "@/lib/rules/sellForm";

export function ConditionPicker({
  name = "condition",
  value,
  onChange,
  columns = "grid-cols-2 lg:grid-cols-4",
}: {
  name?: string;
  value: string | null;
  onChange: (code: string) => void;
  columns?: string;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-semibold">Condition</legend>
      <div className={`mt-2 grid gap-3 ${columns}`}>
        {CONDITIONS.map((c) => {
          const selected = value === c.code;
          return (
            <label
              key={c.code}
              className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-2xl border p-3 ${
                selected ? "border-navy bg-navy text-cream" : "border-line bg-white/60"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={c.code}
                checked={selected}
                onChange={() => onChange(c.code)}
                className="sr-only"
              />
              <span className="font-semibold">{c.name}</span>
              <span className={`text-sm ${selected ? "text-cream/80" : "text-navy/70"}`}>
                {c.code}. {c.short}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
