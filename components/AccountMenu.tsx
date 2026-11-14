"use client";
// The account corner when signed in (story 32). An outlined pill: initials, the first name (desktop only) and ▾
// (design account-icon-options, option C). Tapping it opens a small card under it, on both sizes (design
// account-flyout-options, option A): name and email, then Orders, For sale, Account details (the tabs of story 31)
// and Log out. Esc, a tap outside or a choice close it, and the focus goes back to the pill.
// Log out keeps the user on the page, or sends them home from a page that needs an account (lib/rules/accountTabs).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { logOutFromMenuAction } from "@/app/account/actions";
import { ACCOUNT_TABS, firstName } from "@/lib/rules/accountTabs";
import { initials } from "@/lib/rules/initials";
import { ErrorScreen } from "./ErrorScreen";
import { LoadingMask } from "./LoadingMask";

export function AccountMenu({ name, email, variant }: { name: string; email: string; variant: "desktop" | "phone" }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapper = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  const cardId = useId();
  const path = usePathname();
  const letters = initials(name) || "Me";
  const desktop = variant === "desktop";

  // After Esc or a choice the focus goes back to the pill; after a tap outside it stays where the user tapped.
  function close(backToPill = true) {
    setOpen(false);
    setFailed(false);
    if (backToPill) pill.current?.focus();
  }

  // Esc and a tap outside close the card.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const away = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", away);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", away);
    };
  }, [open]);

  function logOut() {
    setFailed(false);
    startTransition(async () => {
      // On a page that needs an account, the action itself sends the user home.
      const result = await logOutFromMenuAction(path).catch(() => ({ failed: true }));
      if (!result) return; // redirected home by the action
      if (result.failed) return setFailed(true);
      // A full page load, so the header, the cart and the page itself show the signed-out state.
      window.location.reload();
    });
  }

  return (
    <div ref={wrapper} className="relative">
      <button
        ref={pill}
        type="button"
        aria-label={name ? `Your account, signed in as ${name}` : "Your account"}
        aria-expanded={open}
        aria-controls={cardId}
        onClick={() => (open ? close() : setOpen(true))}
        className={
          desktop
            ? `flex min-h-11 items-center gap-2 rounded-full border border-cream py-[3px] pl-[3px] pr-3.5 text-[15px] font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-cream ${
                open ? "bg-white/15" : ""
              }`
            : `flex min-h-11 items-center gap-1 rounded-full border border-navy py-[3px] pl-[3px] pr-2.5 font-semibold ${open ? "bg-sand" : "bg-cream"}`
        }
      >
        <span
          aria-hidden
          className={`flex shrink-0 items-center justify-center rounded-full text-[13px] ${
            desktop ? "h-[34px] w-[34px] bg-cream text-navy" : "h-9 w-9 bg-navy text-cream"
          }`}
        >
          {letters}
        </span>
        {/* A long first name is cut with "…" so the header keeps its height (story 32 · Edge cases). */}
        {desktop && firstName(name) && <span className="max-w-32 truncate">{firstName(name)}</span>}
        <span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div
          id={cardId}
          role="group"
          aria-label="Account menu"
          className={`absolute right-0 top-full z-40 mt-2 max-w-[calc(100vw-24px)] rounded-[20px] border border-line bg-cream p-4 text-left text-navy shadow-[0_12px_30px_rgba(29,36,51,0.18)] ${
            desktop ? "w-80" : "w-[290px]"
          }`}
        >
          {pending && <LoadingMask label="Logging you out…" />}
          <div className="flex items-center gap-3 border-b border-line pb-3">
            <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-[600] text-cream">
              {letters}
            </span>
            <span className="min-w-0">
              {name && <span className="block truncate font-[600]">{name}</span>}
              <span className="block truncate text-sm text-navy/70">{email}</span>
            </span>
          </div>
          {failed ? (
            <div className="mt-3">
              <ErrorScreen message="We couldn't log you out." onRetry={logOut} />
            </div>
          ) : (
            <ul>
              {ACCOUNT_TABS.map((tab) => (
                <li key={tab.id}>
                  <Link
                    href={tab.href}
                    onClick={() => close()}
                    className="flex min-h-[52px] items-center justify-between border-b border-line text-[15px] font-semibold hover:bg-sand/60"
                  >
                    {tab.label}
                    <span aria-hidden>›</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={logOut}
                  disabled={pending}
                  className="flex min-h-[52px] w-full items-center text-left text-[15px] font-semibold hover:bg-sand/60"
                >
                  Log out
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
