"use client";
// Suggestion box under a search box (story 16). useSuggestions holds what the box shows (rule: lib/rules/suggestionBox);
// SuggestionList draws it. Used by the home page and results page box (SearchBox) and the desktop header (HeaderSearch).
// Buyers only: the sell search (story 8) has no suggestion box (DECISIONS · Story 16).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { suggest } from "@/app/actions";
import type { AlbumSummary } from "@/lib/db/albums";
import { isTooShort } from "@/lib/rules/albumSearch";
import {
  moveHighlight,
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


const hrefOf = (a: AlbumSummary) => (a.access === "open" ? `/albums/${a.id}/priorities` : null);

export function useSuggestions(typed: string) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false); // the box opens only after the buyer types, not for a text put there by the page
  const [open, setOpen] = useState(true);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [highlight, setHighlight] = useState<number | null>(null);
  const [nobodySelling, setNobodySelling] = useState<AlbumSummary | null>(null);
  const [attempt, setAttempt] = useState(0);
  const short = isTooShort(typed);

  useEffect(() => {
    setHighlight(null);
    setNobodySelling(null);
    if (!touched || short) return setState({ kind: "idle" });
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
  const visible = touched && open && !short && state.kind !== "idle";

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
      const album = albums[highlight];
      const href = hrefOf(album);
      if (href) router.push(href);
      else if (album.access === "no_listings") setNobodySelling(album);
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
      nobodySelling,
      setNobodySelling,
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
  nobodySelling,
  setNobodySelling,
  close,
  retry,
  typed,
}: ReturnType<typeof useSuggestions>["list"]) {
  if (!visible) return null;
  const rowClass = (i: number) =>
    `flex min-h-14 w-full items-center gap-3 border-b border-line px-3.5 py-2 text-left ${highlight === i ? "bg-sand" : ""}`;
  return (
    <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-[18px] border border-line bg-white shadow-lg">
      <div className="relative min-h-24">
        {state.kind === "loading" && <LoadingMask label="Searching…" />}
        {state.kind === "error" && (
          <ErrorScreen
            message="We couldn't load the albums. Check your connection."
            onRetry={retry}
          />
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
              const href = hrefOf(a);
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
                    {suggestionTag(a)}
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
                  ) : a.access === "no_listings" ? (
                    <button
                      type="button"
                      onClick={() => setNobodySelling(a)}
                      aria-current={highlight === i ? "true" : undefined}
                      className={rowClass(i)}
                    >
                      {inside}
                    </button>
                  ) : (
                    <div className={rowClass(i)}>{inside}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {nobodySelling && (
          <div role="status" className="border-b border-line bg-sand p-4">
            <p className="font-heading text-xl">
              Nobody is selling this album right now
            </p>
            <p className="text-sm text-navy/80">
              {nobodySelling.title} · {nobodySelling.artist}
            </p>
          </div>
        )}
        {content?.kind === "albums" && (
          <Link
            href={`/search?q=${encodeURIComponent(typed.trim())}`}
            onClick={close}
            className="flex min-h-12 items-center justify-between bg-cream px-3.5 text-sm font-semibold"
          >
            <span>See all results for “{typed.trim()}”</span>
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
