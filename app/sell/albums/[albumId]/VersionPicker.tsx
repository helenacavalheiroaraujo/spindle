"use client";
// Choose a version, then "Continue" (finding #72, option B). "My version isn't here" shows the edge-case message.
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SellVersion } from "@/lib/db/albums";

export const NOT_IN_CATALOGUE = "This version isn't in our catalogue yet";

export function VersionPicker({ versions }: { versions: SellVersion[] }) {
  const router = useRouter();
  const [chosen, setChosen] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  return (
    <div className="mt-5">
      <fieldset>
        <legend className="sr-only">Versions</legend>
        <div className="grid gap-3 lg:grid-cols-3">
          {versions.map((v) => {
            const selected = chosen === v.id;
            return (
              <label
                key={v.id}
                className={`flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border p-4 ${
                  selected ? "border-navy bg-navy/5 ring-1 ring-navy" : "border-line bg-white/60"
                }`}
              >
                <input
                  type="radio"
                  name="version"
                  value={v.id}
                  checked={selected}
                  onChange={() => setChosen(v.id)}
                  className="h-5 w-5 shrink-0 accent-navy"
                />
                <span>
                  <span className="block font-semibold">{v.name}</span>
                  <span className="block text-sm text-navy/70">
                    {v.releaseYear} · {v.country} · {v.label} · {v.format}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <button
          type="button"
          disabled={!chosen}
          onClick={() => chosen && router.push(`/sell/versions/${chosen}`)}
          className="min-h-14 w-full rounded-full bg-navy px-8 text-lg font-semibold text-cream disabled:cursor-not-allowed disabled:bg-navy/40 lg:w-auto"
        >
          Continue
        </button>
        {!chosen && <p className="text-center text-sm text-navy/70 lg:text-left">Choose a version to continue</p>}
        <button
          type="button"
          onClick={() => setMissing(true)}
          className="min-h-11 text-center text-sm font-semibold underline lg:ml-auto"
        >
          My version isn&apos;t here
        </button>
      </div>
      {missing && (
        <p role="status" className="mt-3 rounded-2xl border border-line bg-white/60 p-4 text-center font-medium">
          {NOT_IN_CATALOGUE}
        </p>
      )}
    </div>
  );
}
