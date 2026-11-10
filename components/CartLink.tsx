"use client";
// The cart in the header, at the right (story 20 · design part 2, option A): a cart icon with the number of records,
// on phone and desktop. An empty cart shows no number. Signed out, it opens the cart, which asks to log in.
import Link from "next/link";
import { recordCount } from "@/lib/rules/cartTotal";
import { CartIcon } from "./CartIcon";
import { useCartCount } from "./SignedIn";

export function CartLink() {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${recordCount(count)}` : "Cart"}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[#ebe2d0]"
    >
      <CartIcon />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-[11px] font-semibold text-cream"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
