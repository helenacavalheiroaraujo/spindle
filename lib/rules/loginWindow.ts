// The log-in window (story 27): what it says for each action. Covered by tests/unit/loginWindow.test.ts.
import { returnPath } from "./login";
import { formatPrice } from "./recommendation";
import type { Seller } from "./seller";

// buy: Buy or Continue to checkout · cart: Add to cart · sell: Sell · menu: the "Log in" link in the menu.
export type LoginPurpose = "buy" | "cart" | "sell" | "menu";
export type LoginMode = "login" | "signup";

// title: the window heading · note: the line under it (null = none).
export function loginWindowText(purpose: LoginPurpose, mode: LoginMode): { title: string; note: string | null } {
  if (mode === "login") {
    switch (purpose) {
      case "buy":
        return { title: "Log in to buy", note: "You are buying:" };
      case "cart":
        return { title: "Log in to add to your cart", note: null };
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
    case "sell":
      return { title: "Create an account to sell", note: "Selling is free. You need an account." };
    case "menu":
      return { title: "Create an account", note: null };
  }
}

// Which menu links open the window when signed out: "Sell for free" and "Log in". Null = an ordinary link.
export function menuLoginPurpose(signedIn: boolean, href: string | null): LoginPurpose | null {
  if (signedIn || href === null) return null;
  if (href === "/sell") return "sell";
  if (href === "/login" || href.startsWith("/login?")) return "menu";
  return null;
}

// Where the user goes after logging in from the window: the original action goes on (story 27 · Scope).
// buy: the checkout · cart: adds the record, then back to this page · sell: the sell flow · menu: this page.
export function loginWindowNext(purpose: LoginPurpose, here: string, target: string | null = null): string {
  const page = returnPath(here);
  switch (purpose) {
    case "buy":
      return returnPath(target);
    case "cart":
      return target ? `/cart/add/${encodeURIComponent(target)}?next=${encodeURIComponent(page)}` : page;
    case "sell":
      return "/sell";
    case "menu":
      return page;
  }
}

// The record summary in the window (design option A): "Ziggy Stardust · 2012 Remaster · VG+", then "Discos do Bairro, Porto · €28".
export type LoginRecord = { title: string; version: string; condition: string; seller: string; price: string };

export function loginRecord(facts: {
  albumTitle: string;
  versionName: string;
  conditionCode: string;
  seller: Seller;
  city: string | null;
  price: number;
}): LoginRecord {
  const name = facts.seller.kind === "shop" ? facts.seller.shopName : "Private seller";
  return {
    title: facts.albumTitle,
    version: facts.versionName,
    condition: facts.conditionCode,
    seller: facts.city ? `${name}, ${facts.city}` : name,
    price: formatPrice(facts.price),
  };
}
