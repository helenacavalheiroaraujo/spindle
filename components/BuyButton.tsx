"use client";
import Link from "next/link";
import { useState } from "react";

// Buy, or "Buy with protection" on the listing check screen (green and yellow only, story 5).
// Green goes straight to the checkout; yellow first shows what is uncertain, then "Continue to checkout"
// (finding #34, finding #57). The checkout asks for login when signed out (story 7 · Edge cases).
export function BuyButton({
  href,
  warning,
  listingLabel,
  text = "Buy",
}: {
  href: string; // the checkout for this listing
  warning: string[] | null; // null = green
  listingLabel: string;
  text?: string;
}) {
  const [open, setOpen] = useState(false);
  const pill = "flex min-h-12 items-center rounded-full bg-navy px-6 font-semibold text-cream";

  if (!warning) {
    return (
      <Link href={href} aria-label={`${text} ${listingLabel}`} className={pill}>
        {text}
      </Link>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} aria-label={`${text} ${listingLabel}`} className={pill}>
        {text}
      </button>
    );
  }

  return (
    <div role="group" aria-label="Before you buy" className="mt-1 w-full space-y-3">
      <div role="note" className="flex gap-3 rounded-2xl border border-light-amber/60 bg-light-amber/10 p-4 text-sm">
        <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-light-amber font-bold">!</span>
        <p>{warning.join(" ")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={href} className={pill}>
          Continue to checkout
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="min-h-12 rounded-full border border-navy/30 px-6 font-semibold">
          Back
        </button>
      </div>
    </div>
  );
}
