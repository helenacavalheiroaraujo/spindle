"use client";
// "Add to cart" under Buy (story 20 · design part 1, option B): a text link with a cart icon, 48 px high.
// After adding: "Added to your cart" with "View cart". Already in the cart: "In your cart · View cart".
// Signed out: the log-in window opens (story 27, replacing the "Log in to add this record to your cart" line);
// after logging in the record is added on the way back to this page (app/cart/add).
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { addListingToCart } from "@/app/cart/actions";
import { loginWindowNext, type LoginRecord } from "@/lib/rules/loginWindow";
import { CartIcon } from "./CartIcon";
import { ErrorScreen } from "./ErrorScreen";
import { useLoginWindow } from "./LoginWindow";
import { useInCart, useSignedIn } from "./SignedIn";

type Shown = "idle" | "added" | "failed" | "unavailable";

export function AddToCart({ listingId, listingLabel, record }: { listingId: string; listingLabel: string; record: LoginRecord }) {
  const signedIn = useSignedIn();
  const inCart = useInCart(listingId);
  const openLogin = useLoginWindow();
  const button = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState<Shown>("idle");
  const [pending, start] = useTransition();
  const row = "flex min-h-12 flex-wrap items-center justify-end gap-x-2 text-sm";
  const link = "font-semibold underline underline-offset-4";

  function askLogin() {
    const here = window.location.pathname + window.location.search;
    openLogin({ purpose: "cart", next: loginWindowNext("cart", here, listingId), record }, button.current);
  }

  function add() {
    if (!signedIn) return askLogin();
    start(async () => {
      const result = await addListingToCart(listingId);
      if (result === "login") return askLogin(); // the session ended meanwhile
      setShown(result === "added" || result === "already" ? "added" : result === "not_allowed" ? "unavailable" : "failed");
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
  if (shown === "unavailable") {
    return <p role="status" className={row}>This record is no longer available</p>;
  }
  if (shown === "failed") {
    return <ErrorScreen message="We couldn't add it to your cart." onRetry={() => setShown("idle")} />;
  }
  return (
    <button
      ref={button}
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
