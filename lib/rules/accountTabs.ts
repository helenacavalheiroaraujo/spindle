// Your account in tabs (story 31) and the account menu (story 32): covered by tests/unit/accountTabs.test.ts.

export type AccountTab = "orders" | "for-sale" | "details";

// Each tab has its own address; /account itself shows Orders (story 31 · Scope).
export const ACCOUNT_TABS: { id: AccountTab; label: string; href: string }[] = [
  { id: "orders", label: "Orders", href: "/account/orders" },
  { id: "for-sale", label: "For sale", href: "/account/for-sale" },
  { id: "details", label: "Account details", href: "/account/details" },
];

// Which tab an address shows. Null: not a tab of Your account.
export function accountTabFor(path: string): AccountTab | null {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/account" || clean === "/account/orders") return "orders";
  if (clean === "/account/for-sale") return "for-sale";
  if (clean === "/account/details") return "details";
  return null;
}

// The number next to a tab: all the buyer's orders on Orders, listings on sale on For sale, none on Account details.
// Null counts (they could not be loaded) show no number.
export type AccountCounts = { orders: number; forSale: number };
export function tabCount(tab: AccountTab, counts: AccountCounts | null): number | null {
  if (!counts) return null;
  if (tab === "orders") return counts.orders;
  if (tab === "for-sale") return counts.forSale;
  return null;
}

// The first name in the account pill (story 32): the first word of the name given at sign-up.
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

// Pages that need an account (DECISIONS 2026-11-14 · every log-in opens the log-in window, plus My listings and
// the order confirmation). Log out from the menu sends the user home from these; anywhere else they stay (story 32).
const NEEDS_ACCOUNT = ["/account", "/my-listings", "/cart", "/checkout", "/orders", "/sell"];

export function needsAccount(path: string): boolean {
  return NEEDS_ACCOUNT.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

// Where the user is after logging out from the menu: null = stay on this page.
export function afterLogOut(path: string): "/" | null {
  return needsAccount(path) ? "/" : null;
}
