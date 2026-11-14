// The log-in window (story 27): what it says for each action. Covered by tests/unit/loginWindow.test.ts.
import { returnPath } from "./login";
import { formatPrice } from "./recommendation";
import type { Seller } from "./seller";

// buy: Buy or Continue to checkout · cart: Add to cart · sell: Sell · menu: the "Log in" link in the menu.
// cartView: the cart icon and the cart page (bug 32; DECISIONS 2026-11-14, story 29).
export type LoginPurpose = "buy" | "cart" | "cartView" | "sell" | "menu";
export type LoginMode = "login" | "signup";

// title: the window heading · note: the line under it (null = none).
export function loginWindowText(purpose: LoginPurpose, mode: LoginMode): { title: string; note: string | null } {
  if (mode === "login") {
    switch (purpose) {
      case "buy":
        return { title: "Log in to buy", note: "You are buying:" };
      case "cart":
        return { title: "Log in to add to your cart", note: null };
      case "cartView":
        return { title: "Log in to see your cart", note: null };
      case "sell":
        return { title: "Log in to sell", note: "Selling is free. You need an account." };
      case "menu":
        return { title: "Log in", note: "Welcome back." };
    }
  }
  switch (purpose) {
    case "buy":
      return { title: "Create an account to buy", note: null };
    case "cart":
      return { title: "Create an account to add to your cart", note: null };
    case "cartView":
      return { title: "Create an account to see your cart", note: null };
    case "sell":
      return { title: "Create an account to sell", note: "Selling is free. You need an account." };
    case "menu":
      return { title: "Create an account", note: null };
  }
}

// Which header links open the window when signed out: "Sell for free", "Log in" and the cart (bug 32). Null = an
// ordinary link.
export function menuLoginPurpose(signedIn: boolean, href: string | null): LoginPurpose | null {
  if (signedIn || href === null) return null;
  if (href === "/sell") return "sell";
  if (href === "/cart") return "cartView";
  if (href === "/login" || href.startsWith("/login?")) return "menu";
  return null;
}

// Where the user goes after logging in from the window: the original action goes on (story 27 · Scope).
// buy: the checkout · cart: adds the record, then back to this page · cartView: the cart · sell: the sell flow ·
// menu: this page.
export function loginWindowNext(purpose: LoginPurpose, here: string, target: string | null = null): string {
  const page = returnPath(here);
  switch (purpose) {
    case "buy":
      return returnPath(target);
    case "cart":
      return target ? `/cart/add/${encodeURIComponent(target)}?next=${encodeURIComponent(page)}` : page;
    case "cartView":
      return "/cart";
    case "sell":
      return "/sell";
    case "menu":
      return page;
  }
}

// A page that needs an account, opened signed out (story 29, design option C): only the header, with the window on
// top. Which window each page opens; after logging in, the same page loads with its content.
// Checkout: the record (design B) · cart and cart checkout: the cart · sell: Sell · Your account and orders: Log in.
// Adding to the cart from a link: Add to cart. Null = the page does not need an account.
export function gatePurpose(path: string): LoginPurpose | null {
  const under = (base: string) => path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`);
  if (under("/checkout")) return "buy";
  if (under("/cart/add")) return "cart";
  if (under("/cart")) return "cartView";
  if (under("/sell")) return "sell";
  if (under("/account") || under("/orders")) return "menu";
  return null;
}

// Closing the window on a page that needs an account (story 29 · Scope): back to the previous page, or the home page
// if there is none. "Previous" means the previous Spindle page in this tab (PageTrail): a bookmark opened in a new tab,
// or a link from another site, goes home, not back to the browser's start page or the other site. The same page again
// (a reload) has no previous page either.
export function gateCloseTarget(previous: string | null, here: string): "back" | "home" {
  return previous && previous !== here ? "back" : "home";
}

// The record in the window's left panel (story 29, design B): the cover, "Ziggy Stardust", "2012 Remaster · VG+",
// "Discos do Bairro, Porto" and "€28". No cover photo: an empty square.
export type LoginRecord = { title: string; version: string; condition: string; seller: string; price: string; cover: string | null };

export function loginRecord(facts: {
  albumTitle: string;
  versionName: string;
  conditionCode: string;
  seller: Seller;
  city: string | null;
  price: number;
  cover?: string | null;
}): LoginRecord {
  const name = facts.seller.kind === "shop" ? facts.seller.shopName : "Private seller";
  return {
    title: facts.albumTitle,
    version: facts.versionName,
    condition: facts.conditionCode,
    seller: facts.city ? `${name}, ${facts.city}` : name,
    price: formatPrice(facts.price),
    cover: facts.cover ?? null,
  };
}

// The left panel of the window (story 29, designs B and B1). With a record: the protection line under it. Without one:
// what Spindle does, in three lines.
export const PROTECTION_LINE = "Spindle holds your payment until you confirm it's all good.";
export const PROMISE_HEADING = "The right pressing, a verified copy.";
export const PROMISE_LINES = [
  "We tell you which version to buy",
  "Every copy is checked against it",
  "Spindle holds your payment until you confirm it's all good",
] as const;
