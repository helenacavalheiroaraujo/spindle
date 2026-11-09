// The items of the menu (story 15): one place, covered by tests/unit/menuItems.test.ts.
// Home, Sell and Your account (Log in when signed out) work; Artists and All genres and formats are illustrative
// future features: "Coming soon", no link.
import { withReturn } from "./login";

export type MenuItem = { label: string; href: string | null; current: boolean; soon: boolean };

// "Log in" brings the user back to the page they were on (as the corner link does, story 9). On the log-in and
// sign-up pages it keeps the return address they already carry.
export function menuItems(signedIn: boolean, path: string, query = ""): MenuItem[] {
  const onLogin = path === "/login" || path === "/signup";
  const next = onLogin ? new URLSearchParams(query).get("next") ?? "/" : query ? `${path}?${query}` : path;
  const under = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`);
  return [
    { label: "Home", href: "/", current: path === "/", soon: false },
    { label: "Sell for free", href: "/sell", current: under("/sell"), soon: false },
    signedIn
      ? { label: "Your account", href: "/account", current: under("/account") || under("/my-listings"), soon: false }
      : { label: "Log in", href: withReturn("/login", next), current: under("/login") || under("/signup"), soon: false },
    { label: "Artists", href: null, current: false, soon: true },
    { label: "All genres and formats", href: null, current: false, soon: true },
  ];
}
