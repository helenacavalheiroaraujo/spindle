"use client";
import { useId, useState } from "react";

// Buy, or "Buy with protection" on the listing check screen (green and yellow only, story 5). A yellow listing first shows what is uncertain (finding #34).
// Checkout does not exist yet (story 7), so "Continue to checkout" is disabled for now.
export function BuyButton({
  warning,
  listingLabel,
  text = "Buy",
}: {
  warning: string[] | null;
  listingLabel: string;
  text?: string;
}) {
  const [open, setOpen] = useState(false);
  const noteId = useId();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${text} ${listingLabel}`}
        className="min-h-12 rounded-full bg-navy px-6 font-semibold text-cream"
      >
        {text}
      </button>
    );
  }

  return (
    <div role="group" aria-label="Before you buy" className="mt-1 w-full space-y-3">
      {warning && (
        <div role="note" className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm">
          <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 font-bold">!</span>
          <p>{warning.join(" ")}</p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled
          aria-describedby={noteId}
          className="min-h-12 cursor-not-allowed rounded-full bg-navy/40 px-6 font-semibold text-cream"
        >
          Continue to checkout
        </button>
        <button type="button" onClick={() => setOpen(false)} className="min-h-12 rounded-full border border-navy/30 px-6 font-semibold">
          Back
        </button>
      </div>
      <p id={noteId} className="text-xs text-navy/70">Checkout comes in story 7</p>
    </div>
  );
}
