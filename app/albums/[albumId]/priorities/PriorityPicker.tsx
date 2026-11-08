"use client";
// The four options and "See recommendation" (story 2). The ranking rule lives in lib/rules/priorities.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePriorities } from "@/app/actions";
import {
  PRIORITIES, canContinue, formatPriorities, rankOf, togglePriority, type Priority,
} from "@/lib/rules/priorities";

export function PriorityPicker({ albumId, initial }: { albumId: string; initial: Priority[] }) {
  const router = useRouter();
  const [ranking, setRanking] = useState<Priority[]>(initial);
  const [saving, setSaving] = useState(false);
  const ready = canContinue(ranking);

  // Saved to the account first when signed in (phase 2), then on to the recommendation.
  async function continueToRecommendation() {
    setSaving(true);
    const value = formatPriorities(ranking);
    await savePriorities(value).catch(() => {});
    router.push(`/albums/${albumId}/recommendation?priorities=${value}`);
  }

  return (
    <>
      <ul className="mt-6 space-y-3">
        {PRIORITIES.map((p) => {
          const rank = rankOf(ranking, p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={rank !== null}
                onClick={() => setRanking((r) => togglePriority(r, p.id))}
                className={`flex min-h-20 w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left ${
                  rank !== null ? "border-2 border-navy bg-navy/10" : "border-line bg-white/60"
                }`}
              >
                {/* The rank is a number, not a colour (accessibility). */}
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-semibold ${
                    rank !== null ? "border-navy bg-navy text-cream" : "border-navy/40"
                  }`}
                >
                  {rank}
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-semibold">{p.label}</span>
                  <span className="block text-sm text-navy/70">{p.line}</span>
                </span>
                {rank !== null && <span className="sr-only">, rank {rank}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        disabled={!ready || saving}
        onClick={continueToRecommendation}
        className="mt-8 min-h-14 w-full rounded-full bg-navy px-6 text-lg font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        See recommendation
      </button>
      {!ready && <p className="mt-2 text-center text-sm text-navy/70">Pick at least one to continue.</p>}
    </>
  );
}
