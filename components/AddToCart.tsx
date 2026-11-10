"use client";
// "Add to cart" under Buy (story 20 · design part 1, option B): a text link with a cart icon, 48 px high.
// After adding: "Added to your cart" with "View cart". Already in the cart: "In your cart · View cart".
// Signed out: "Log in to add this record to your cart"; after logging in the record is added (app/cart/add).
import Link from "next/link";
import { useState, useTransition } from "react";
import { addListingToCart } from "@/app/cart/actions";
import { withReturn } from "@/lib/rules/login";
import { CartIcon } from "./CartIcon";
import { ErrorScreen } from "./ErrorScreen";
import { useInCart, useSignedIn } from "./SignedIn";

type Shown = "idle" | "added" | "login" | "failed" | "unavailable";

export function AddToCart({ listingId, listingLabel }: { listingId: string; listingLabel: string }) {
  const signedIn = useSignedIn();
  const inCart = useInCart(listingId);
  const [shown, setShown] = useState<Shown>("idle");
  const [loginHref, setLoginHref] = useState("/login");
  const [pending, start] = useTransition();
  const row = "flex min-h-12 flex-wrap items-center justify-end gap-x-2 text-sm";
  const link = "font-semibold underline underline-offset-4";

  function add() {
    if (!signedIn) {
      // Back to this page after logging in; the record is added on the way (app/cart/add).
      const here = window.location.pathname + window.location.search;
      setLoginHref(withReturn("/login", `/cart/add/${listingId}?next=${encodeURIComponent(here)}`));
      setShown("login");
      return;
    }
    start(async () => {
      const result = await addListingToCart(listingId);
      setShown(result === "added" || result === "already" ? "added" : result === "not_allowed" ? "unavailable" : result === "login" ? "login" : "failed");
    });
  }

  if (shown === "added") {
    return (
      <p role="status" className={row}>
        <CartIcon className="h-4 w-4" />
        <span>Added to your cart</span>
        <Link href="/cart" className={link}>View cart</Link>
      </p>
    );
  }
  if (inCart) {
    return (
      <p className={row}>
        <CartIcon className="h-4 w-4" />
        <span>In your cart ·</span>
        <Link href="/cart" className={link}>View cart</Link>
      </p>
    );
  }
  if (shown === "login") {
    return (
      <p role="status" className={row}>
        <span>Log in to add this record to your cart</span>
        <Link href={loginHref} className={link}>Log in</Link>
      </p>
    );
  }
  if (shown === "unavailable") {
    return <p role="status" className={row}>This record is no longer available</p>;
  }
  if (shown === "failed") {
    return <ErrorScreen message="We couldn't add it to your cart." onRetry={() => setShown("idle")} />;
  }
  return (
    <button
      type="button"
      onClick={add}
      disabled={pending}
      aria-label={`Add to cart ${listingLabel}`}
      className="flex min-h-12 items-center gap-2 rounded-full px-3 text-sm font-semibold underline underline-offset-4 disabled:opacity-60"
    >
      <CartIcon className="h-4 w-4" />
      {pending ? "Adding…" : "Add to cart"}
    </button>
  );
}
