"use client";
// The menu (stories 15, 19). Desktop: cells in the top row of the header (MenuRow), each a link plus a chevron whose box
// says there is nothing there yet. Phone: a ☰ button, top left, that opens a side drawer (MenuDrawer), each row with a
// chevron too. The items come from lib/rules/menuItems; "Soon" items are not links.
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { desktopMenu, menuItems, type DesktopCell, type MenuItem } from "@/lib/rules/menuItems";
import { initials } from "@/lib/rules/initials";
import { CartLink } from "./CartLink";
import { CartIcon } from "./CartIcon";
import { useAccountName, useCartCount, useSignedIn } from "./SignedIn";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SoonTag() {
  return <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-navy/60">Soon</span>;
}

// One desktop cell: the link, and a chevron that opens a small box by hover, click or Enter; Esc and a click outside
// close it. The box sits inside the cell, so the pointer can move onto it without closing it.
function Cell({ cell }: { cell: DesktopCell }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const chevron = useRef<HTMLButtonElement>(null);
  const boxId = useId();
  const shown = open || hover;

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  // Esc closes the box wherever the focus is (a box opened by hover has no focus inside it).
  useEffect(() => {
    if (!shown) return;
    const onEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (ref.current?.contains(document.activeElement)) chevron.current?.focus();
      setOpen(false);
      setHover(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [shown]);

  const text = `flex min-h-11 items-center gap-2 rounded-l-full pl-3.5 pr-1 text-[15px] ${
    cell.soon ? "font-medium text-navy/60" : "font-semibold"
  }`;
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative flex items-center rounded-full hover:bg-[#ebe2d0] ${cell.cta ? "border-[1.5px] border-navy hover:bg-sand" : ""}`}
    >
      {cell.href ? (
        <Link
          href={cell.href}
          aria-label={cell.accountLabel ?? undefined}
          aria-current={cell.current ? "page" : undefined}
          className={`${text} ${cell.cta ? "pl-[18px]" : ""}`}
        >
          {cell.label}
        </Link>
      ) : (
        <span aria-disabled="true" className={text}>
          {cell.label}
          <SoonTag />
        </span>
      )}
      {cell.note && (
      <button
        ref={chevron}
        type="button"
        aria-label={`More about ${cell.accountLabel ? "your account" : cell.label}`}
        aria-expanded={shown}
        aria-controls={boxId}
        onClick={() => setOpen((o) => !o)}
        className={`flex min-h-11 w-10 items-center justify-center rounded-r-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-navy ${
          cell.soon ? "text-navy/60" : ""
        }`}
      >
        <Chevron open={shown} />
      </button>
      )}
      {shown && cell.note && (
        <div id={boxId} className="absolute right-0 top-full z-30 w-64 pt-2">
          <div className="rounded-2xl border border-line bg-[#fffdf9] p-4 shadow-lg">
            <p className="text-sm font-semibold">{cell.note.title}</p>
            <p className="mt-0.5 text-[13px] text-navy/70">{cell.note.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function MenuRow() {
  const signedIn = useSignedIn();
  const name = useAccountName();
  const cells = desktopMenu(signedIn, usePathname(), useSearchParams().toString(), initials(name), name);
  return (
    <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
      {cells.map((cell) => (
        <div key={cell.label} className="flex items-center gap-0.5">
          {cell.divider && <span aria-hidden className="mx-2 h-5 w-px bg-line" />}
          <Cell cell={cell} />
        </div>
      ))}
      <CartLink />
    </nav>
  );
}

// A drawer row: the link (or the "Coming soon" label) and a 48 px chevron that opens the same message under the row.
function DrawerRow({ item, open, onToggle, onNavigate }: { item: MenuItem; open: boolean; onToggle: () => void; onNavigate: () => void }) {
  const boxId = useId();
  return (
    <>
      <div className="flex items-center">
        {item.href ? (
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={item.current ? "page" : undefined}
            className={`flex min-h-14 flex-1 items-center rounded-xl px-3 text-base font-semibold hover:bg-sand ${item.current ? "bg-sand" : ""}`}
          >
            {item.label === "Cart" && <CartIcon className="mr-2 h-5 w-5" />}
            {item.label}
            {item.count > 0 && <span className="ml-auto mr-2 rounded-full bg-navy px-2 text-sm font-semibold text-cream">{item.count}</span>}
          </Link>
        ) : (
          <span aria-disabled="true" className="flex min-h-14 flex-1 items-center justify-between gap-2 px-3 text-base text-navy/60">
            {item.label}
            <span className="shrink-0 whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-navy/60">Coming soon</span>
          </span>
        )}
        {item.note && (
          <button
            type="button"
            aria-label={`More about ${item.label}`}
            aria-expanded={open}
            aria-controls={boxId}
            onClick={onToggle}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full hover:bg-sand"
          >
            <Chevron open={open} />
          </button>
        )}
      </div>
      {open && item.note && (
        <div id={boxId} className="mx-3 mb-2 rounded-xl bg-cream p-3 text-[13px] text-navy/70">
          <p className="text-sm font-semibold text-navy">{item.note.title}</p>
          {item.note.text}
        </div>
      )}
    </>
  );
}

export function MenuDrawer() {
  const items = menuItems(useSignedIn(), usePathname(), useSearchParams().toString(), useCartCount());
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) closer.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setExpanded(null);
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
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-[#fffdf9] p-4 shadow-2xl"
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
                <li key={item.label} className={i === 4 ? "mt-2 border-t border-line pt-2" : ""}>
                  <DrawerRow
                    item={item}
                    open={expanded === item.label}
                    onToggle={() => setExpanded((e) => (e === item.label ? null : item.label))}
                    onNavigate={() => setOpen(false)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
