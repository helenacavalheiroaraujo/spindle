// The items of the menu (story 15, story 19): one place, covered by tests/unit/menuItems.test.ts.
// Sell, Your account (Log in when signed out) and Cart (story 20) work; Artists and All genres and formats are illustrative
// future features: "Soon", no link. Every item has a chevron whose box says there is nothing there yet (story 19).
import { withReturn } from "./login";

export type MenuNote = { title: string; text: string };
// count: the records in the cart, shown on the Cart cell only (story 20); 0 shows no number.
export type MenuItem = { label: string; href: string | null; current: boolean; soon: boolean; note: MenuNote; count: number };

const NOTHING_YET: MenuNote = { title: "Nothing here yet", text: "More options will appear here in the future." };
const COMING_SOON: MenuNote = { title: "Coming soon", text: "This will open more options in the future." };

// "Log in" brings the user back to the page they were on (as the corner link did, story 9). On the log-in and
// sign-up pages it keeps the return address they already carry.
export function menuItems(signedIn: boolean, path: string, query = "", cartCount = 0): MenuItem[] {
  const onLogin = path === "/login" || path === "/signup";
  const next = onLogin ? new URLSearchParams(query).get("next") ?? "/" : query ? `${path}?${query}` : path;
  const under = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`);
  return [
    { label: "Home", href: "/", current: path === "/", soon: false, note: NOTHING_YET, count: 0 },
    { label: "Sell for free", href: "/sell", current: under("/sell"), soon: false, note: NOTHING_YET, count: 0 },
    signedIn
      ? { label: "Your account", href: "/account", current: under("/account") || under("/my-listings"), soon: false, note: NOTHING_YET, count: 0 }
      : { label: "Log in", href: withReturn("/login", next), current: under("/login") || under("/signup"), soon: false, note: NOTHING_YET, count: 0 },
    { label: "Cart", href: "/cart", current: under("/cart"), soon: false, note: NOTHING_YET, count: cartCount },
    { label: "Artists", href: null, current: false, soon: true, note: COMING_SOON, count: 0 },
    { label: "All genres and formats", href: null, current: false, soon: true, note: COMING_SOON, count: 0 },
  ];
}

export type DesktopCell = MenuItem & { cta: boolean; divider: boolean; accountLabel: string | null };

// The desktop menu (story 19), left to right: Artists, All genres and formats, a divider, Log in (the initials when
// signed in) and Sell for free. Home is the logo. "Log in" is not shown on the log-in and sign-up pages (story 9).
export function desktopMenu(signedIn: boolean, path: string, query = "", initials = "", name = ""): DesktopCell[] {
  const all = menuItems(signedIn, path, query);
  const [, sell, account, , artists, genres] = all; // the cart is the icon at the right of the header (story 20)
  const onLogin = path === "/login" || path === "/signup";
  const cells: DesktopCell[] = [
    { ...artists, cta: false, divider: false, accountLabel: null },
    { ...genres, cta: false, divider: false, accountLabel: null },
  ];
  if (signedIn) {
    cells.push({
      ...account,
      label: initials || "Me",
      cta: false,
      divider: true,
      accountLabel: name ? `Your account, signed in as ${name}` : "Your account",
    });
  } else if (!onLogin) {
    cells.push({ ...account, cta: false, divider: true, accountLabel: null });
  }
  cells.push({ ...sell, cta: true, divider: !cells.some((c) => c.divider), accountLabel: null });
  return cells;
}
