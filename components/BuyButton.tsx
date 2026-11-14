"use client";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { loginWindowNext, type LoginRecord } from "@/lib/rules/loginWindow";
import { useLoginWindow } from "./LoginWindow";
import { useSignedIn } from "./SignedIn";

// Buy, or "Buy with protection" on the listing check screen (green and yellow only, story 5).
// Green goes straight to the checkout; yellow first shows what is uncertain, then "Continue to checkout"
// (finding #34, finding #57). Signed out, Buy and Continue to checkout open the log-in window, which then goes on
// to the checkout (story 27). The checkout itself still asks for login if its address is opened directly.
export function BuyButton({
  href,
  warning,
  listingLabel,
  record,
  text = "Buy",
}: {
  href: string; // the checkout for this listing
  warning: string[] | null; // null = green
  listingLabel: string;
  record: LoginRecord; // shown in the log-in window (story 27)
  text?: string;
}) {
  const [open, setOpen] = useState(false);
  const signedIn = useSignedIn();
  const openLogin = useLoginWindow();

  function toCheckout(e: MouseEvent<HTMLAnchorElement>) {
    if (signedIn) return;
    e.preventDefault();
    const here = window.location.pathname + window.location.search;
    openLogin({ purpose: "buy", next: loginWindowNext("buy", here, href), record }, e.currentTarget);
  }
  const pill = "flex min-h-12 items-center rounded-full bg-navy px-6 font-semibold text-cream";

  if (!warning) {
    return (
      <Link href={href} onClick={toCheckout} aria-label={`${text} ${listingLabel}`} className={pill}>
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
        <Link href={href} onClick={toCheckout} className={pill}>
          Continue to checkout
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="min-h-12 rounded-full border border-navy/30 px-6 font-semibold">
          Back
        </button>
      </div>
    </div>
  );
}
