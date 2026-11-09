"use client";
// The menu (story 15). Desktop: a row of links under the search box (MenuRow). Phone: a ☰ button, top left, that opens
// a side drawer (MenuDrawer). The items come from lib/rules/menuItems; "Coming soon" items are not links.
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { menuItems, type MenuItem } from "@/lib/rules/menuItems";
import { useSignedIn } from "./SignedIn";

function ComingSoon({ item, className }: { item: MenuItem; className: string }) {
  return (
    <span aria-disabled="true" className={className}>
      {item.label}
      <span className="shrink-0 whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-navy/60">Coming soon</span>
    </span>
  );
}

export function MenuRow() {
  const items = menuItems(useSignedIn(), usePathname(), useSearchParams().toString());
  return (
    <nav aria-label="Main" className="mt-1 hidden items-center gap-1.5 pb-3 lg:flex">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i === 3 && <span aria-hidden className="mx-2 h-5 w-px bg-line" />}
          {item.href ? (
            <Link
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={`flex min-h-10 items-center rounded-full border px-3.5 text-sm font-semibold ${
                item.current ? "border-line bg-sand" : "border-transparent"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <ComingSoon item={item} className="flex min-h-10 items-center gap-2 px-3.5 text-sm text-navy/60" />
          )}
        </span>
      ))}
    </nav>
  );
}

export function MenuDrawer() {
  const items = menuItems(useSignedIn(), usePathname(), useSearchParams().toString());
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) closer.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    opener.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") return close();
    if (e.key !== "Tab") return;
    // Keep the focus inside the open drawer.
    const focusable = drawer.current?.querySelectorAll<HTMLElement>("a[href], button");
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="lg:hidden">
      <button
        ref={opener}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="absolute left-0 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-navy bg-white"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-40" onKeyDown={onKeyDown}>
          <div aria-hidden className="absolute inset-0 bg-navy/35" onClick={close} />
          <div
            ref={drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-[#fffdf9] p-4 shadow-2xl"
          >
            <button
              ref={closer}
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-navy"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <ul>
              {items.map((item, i) => (
                <li key={item.label} className={i === 3 ? "mt-2 border-t border-line pt-2" : ""}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={item.current ? "page" : undefined}
                      className={`flex min-h-14 items-center rounded-xl px-3 text-base font-semibold ${item.current ? "bg-sand" : ""}`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <ComingSoon item={item} className="flex min-h-14 items-center justify-between gap-2 px-3 text-base text-navy/60" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
