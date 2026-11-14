"use client";
// Suggestion box under a search box (story 16). useSuggestions holds what the box shows (rule: lib/rules/suggestionBox);
// SuggestionList draws it. Used by the home page and results page box (SearchBox) and the desktop header (HeaderSearch).
// Buyers only: the sell search (story 8) has no suggestion box (DECISIONS · Story 16).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { suggest } from "@/app/actions";
import type { AlbumSummary } from "@/lib/db/albums";
import { isTooShort, SHORT_SEARCH_MESSAGE } from "@/lib/rules/albumSearch";
import {
  albumHref,
  boxContent,
  moveHighlight,
  NOBODY_SELLING_TAG,
  suggestionTag,
  type BoxContent,
} from "@/lib/rules/suggestionBox";
import { LoadingMask } from "./LoadingMask";
import { ErrorScreen } from "./ErrorScreen";

type State =
  | { kind: "idle" }
  | { kind: "loading"; previous?: BoxContent<AlbumSummary> }
  | { kind: "done"; content: BoxContent<AlbumSummary> }
  | { kind: "error" };


export function useSuggestions(typed: string) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false); // the box opens only after the buyer types, not for a text put there by the page
  const [open, setOpen] = useState(true);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [highlight, setHighlight] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const short = isTooShort(typed);

  useEffect(() => {
    setHighlight(null);
    if (!touched) return setState({ kind: "idle" });
    // Under 3 characters no search runs: the rule says at once whether the box shows nothing or the hint (bug 26).
    if (short) return setState({ kind: "done", content: boxContent<AlbumSummary>([], typed) });
    let current = true; // the box always shows the result of the last text typed
    setState((s) => ({
      kind: "loading",
      previous: s.kind === "done" ? s.content : undefined,
    }));
    const timer = setTimeout(() => {
      suggest(typed)
        .then((content) => current && setState({ kind: "done", content }))
        .catch(() => current && setState({ kind: "error" }));
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [typed, touched, short, attempt]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const content =
    state.kind === "done"
      ? state.content
      : state.kind === "loading"
        ? state.previous
        : undefined;
  const albums = content && "albums" in content ? content.albums : [];
  const visible = touched && open && state.kind !== "idle" && content?.kind !== "none";

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") return setOpen(false);
    if (!visible) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) =>
        moveHighlight(h, e.key as "ArrowDown" | "ArrowUp", albums.length),
      );
    } else if (e.key === "Enter" && highlight !== null) {
      e.preventDefault();
      const href = albumHref(albums[highlight]);
      if (href) router.push(href);
    }
  }

  return {
    wrapperRef,
    onTyped: () => {
      setTouched(true);
      setOpen(true);
    },
    inputProps: { onKeyDown, onFocus: () => setOpen(true) },
    list: {
      visible,
      state,
      content,
      highlight,
      close: () => setOpen(false),
      retry: () => setAttempt((n) => n + 1),
      typed,
    },
  };
}

export function SuggestionList({
  visible,
  state,
  content,
  highlight,
  close,
  retry,
  typed,
  wide = false,
}: ReturnType<typeof useSuggestions>["list"] & { wide?: boolean }) {
  if (!visible) return null;
  const rowClass = (i: number) =>
    `group flex min-h-14 w-full items-center gap-3 border-b border-line px-3.5 py-2 text-left hover:bg-sand ${highlight === i ? "bg-sand" : ""}`;
  return (
    <div className={`absolute top-full z-20 mt-2 overflow-hidden rounded-[18px] border border-line bg-white shadow-lg ${wide ? "left-0 w-[28rem] max-w-[90vw]" : "inset-x-0"}`}>
      <div className="relative min-h-24">
        {state.kind === "loading" && <LoadingMask label="Searching…" />}
        {state.kind === "error" && (
          <ErrorScreen
            message="We couldn't load the albums. Check your connection."
            onRetry={retry}
          />
        )}
        {content?.kind === "tooShort" && (
          <p className="p-4 font-medium">{SHORT_SEARCH_MESSAGE}</p>
        )}
        {content?.kind === "empty" && (
          <p className="p-4 font-medium">No albums found</p>
        )}
        {content?.kind === "didYouMean" && (
          <p className="px-3.5 pt-3 text-sm font-medium">Did you mean…?</p>
        )}
        {content && "albums" in content && (
          <ul aria-label="Suggestions">
            {content.albums.map((a, i) => {
              const href = albumHref(a);
              // Hovered or highlighted, a "No listings" tag says why (bug 28). Hover is CSS, so it needs no state.
              const highlighted = highlight === i;
              const inside = (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className="h-11 w-11 shrink-0 rounded-lg bg-sand">
                    <img
                      src={a.coverUrl}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-lg"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {a.title}
                    </span>
                    <span className="block text-xs text-navy/70">
                      {a.artist}, {a.releaseYear}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-navy/10 px-2.5 py-0.5 text-[11px] font-semibold">
                    {a.access === "no_listings" && !highlighted ? (
                      <>
                        <span className="group-hover:hidden">{suggestionTag(a)}</span>
                        <span className="hidden group-hover:inline">{NOBODY_SELLING_TAG}</span>
                      </>
                    ) : (
                      suggestionTag(a, highlighted)
                    )}
                  </span>
                </>
              );
              return (
                <li key={a.id}>
                  {href ? (
                    <Link
                      href={href}
                      onClick={close}
                      aria-current={highlight === i ? "true" : undefined}
                      className={rowClass(i)}
                    >
                      {inside}
                    </Link>
                  ) : (
                    <div className={rowClass(i)}>{inside}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {content?.kind === "albums" && (
          <Link
            href={`/search?q=${encodeURIComponent(typed.trim())}`}
            onClick={close}
            className="flex min-h-12 items-center justify-between bg-cream px-3.5 text-sm font-semibold hover:bg-sand"
          >
            <span>See all results for “{typed.trim()}”</span>
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
