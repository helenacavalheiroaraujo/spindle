"use client";
// "Buying priorities" on Your account: the saved order (story 23) and "Change" (story 26, design option B).
// Shows what the rules in lib/rules/priorities.ts return; never moves or checks anything itself.
import { useActionState, useEffect, useState } from "react";
import { saveRankingAction, type RankingState } from "./actions";
import { ErrorScreen } from "@/components/ErrorScreen";
import { LoadingMask } from "@/components/LoadingMask";
import {
  accountPriorityLines,
  addPriority,
  formatPriorities,
  missingPriorities,
  movePriority,
  PRIORITIES,
  rowArrows,
  type Priority,
} from "@/lib/rules/priorities";

const initial: RankingState = { status: "ready" };
const labelOf = (id: Priority) => PRIORITIES.find((p) => p.id === id)!.label;
const arrow = "flex h-11 w-11 items-center justify-center rounded-full border border-navy bg-white font-bold";
const num = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold";

export function PrioritiesSection({ saved }: { saved: Priority[] }) {
  const [state, action, pending] = useActionState(saveRankingAction, initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Priority[]>(saved);
  const [dismissed, setDismissed] = useState<RankingState | null>(null);

  // After "Save my order" the page shows the new saved order.
  useEffect(() => {
    if (state.status === "done") setEditing(false);
  }, [state]);

  const start = () => {
    setDraft(saved);
    setEditing(true);
  };

  if (state.status === "failed" && dismissed !== state) {
    return (
      <section aria-label="Buying priorities" className="mt-6">
        <ErrorScreen message="We couldn't save your order." onRetry={() => setDismissed(state)} />
      </section>
    );
  }

  return (
    <section aria-label="Buying priorities" className="relative mt-6 rounded-2xl border border-line bg-white/60 p-5">
      {pending && <LoadingMask label="Saving…" />}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-3xl leading-tight">Buying priorities</h2>
        {!editing && (
          <button
            type="button"
            onClick={start}
            className="min-h-11 rounded-full border border-navy px-4 font-semibold hover:bg-navy hover:text-cream"
          >
            Change
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-navy/70">Your order, used for the recommendation when you buy.</p>

      {!editing ? (
        <ol className="mt-4 space-y-2">
          {accountPriorityLines(saved).map((line) => (
            <li key={line.rank} className="flex items-center gap-3 rounded-full border border-line bg-white px-2 py-2">
              <span className={`${num} bg-navy text-cream`}>{line.rank}</span>
              <span className="font-medium">{line.label}</span>
            </li>
          ))}
        </ol>
      ) : (
        <form action={action}>
          <input type="hidden" name="ranking" value={formatPriorities(draft)} />
          <ol className="mt-4 space-y-2">
            {draft.map((id, i) => {
              const arrows = rowArrows(draft, id);
              return (
                <li key={id} className="flex items-center gap-3 rounded-full border border-line bg-white py-1 pl-2 pr-1">
                  <span className={`${num} bg-navy text-cream`}>{i + 1}</span>
                  <span className="font-medium">{labelOf(id)}</span>
                  <span className="ml-auto flex gap-1.5">
                    {arrows.up ? (
                      <button type="button" aria-label={`Move ${labelOf(id)} up`} onClick={() => setDraft(movePriority(draft, id, "up"))} className={`${arrow} hover:bg-navy hover:text-cream`}>
                        <span aria-hidden>↑</span>
                      </button>
                    ) : (
                      <span aria-hidden className="h-11 w-11" />
                    )}
                    {arrows.down ? (
                      <button type="button" aria-label={`Move ${labelOf(id)} down`} onClick={() => setDraft(movePriority(draft, id, "down"))} className={`${arrow} hover:bg-navy hover:text-cream`}>
                        <span aria-hidden>↓</span>
                      </button>
                    ) : (
                      <span aria-hidden className="h-11 w-11" />
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
          {missingPriorities(draft).length > 0 && (
            <ul className="mt-2 space-y-2">
              {missingPriorities(draft).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setDraft(addPriority(draft, p.id))}
                    className="flex min-h-12 w-full items-center gap-3 rounded-full border border-dashed border-line bg-white/60 px-2 text-left font-medium hover:border-navy"
                  >
                    <span aria-hidden className={`${num} border border-dashed border-navy/40 text-navy/50`}>+</span>
                    Add {p.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="min-h-12 flex-1 rounded-full border border-navy px-4 font-semibold hover:bg-navy/5"
            >
              Cancel
            </button>
            <button type="submit" disabled={pending} className="min-h-12 flex-1 rounded-full bg-navy px-4 font-semibold text-cream hover:bg-navy/90">
              Save my order
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
