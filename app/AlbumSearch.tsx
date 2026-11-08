"use client";
// Search box and results (story 1). Rules live in lib/rules; this screen only shows what they return.
// mode "sell" (story 8 · finding #36): same box and matching, but every album opens its list of versions,
// with no "No listings" or "Not in the demo" tags.
import Link from "next/link";
import { useEffect, useState } from "react";
import { search, type SearchResponse } from "./actions";
import type { AlbumSummary } from "@/lib/db/albums";
import { MIN_SEARCH_LENGTH, normalize } from "@/lib/rules/albumSearch";
import { LoadingMask } from "@/components/LoadingMask";
import { ErrorScreen } from "@/components/ErrorScreen";

type State =
  | { kind: "idle" }
  | { kind: "loading"; previous?: SearchResponse }
  | { kind: "done"; response: SearchResponse }
  | { kind: "error" };

type Mode = "buy" | "sell";

// "initial": a search typed in the header (desktop) arrives as ?q=. "boxOnPhoneOnly": on desktop the box lives in the
// header (story 12), so the one on the page is hidden there; the results stay.
export function AlbumSearch({
  mode = "buy",
  initial = "",
  boxOnPhoneOnly = false,
}: {
  mode?: Mode;
  initial?: string;
  boxOnPhoneOnly?: boolean;
}) {
  const [typed, setTyped] = useState(initial);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [attempt, setAttempt] = useState(0);
  const [nobodySelling, setNobodySelling] = useState<AlbumSummary | null>(null);
  const tooShort = normalize(typed).length < MIN_SEARCH_LENGTH;

  useEffect(() => {
    setNobodySelling(null);
    if (tooShort) return setState({ kind: "idle" });
    let current = true;
    setState((s) => ({ kind: "loading", previous: s.kind === "done" ? s.response : undefined }));
    const timer = setTimeout(() => {
      search(typed)
        .then((response) => current && setState({ kind: "done", response }))
        .catch(() => current && setState({ kind: "error" }));
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [typed, tooShort, attempt]);

  const response = state.kind === "done" ? state.response : state.kind === "loading" ? state.previous : undefined;

  return (
    <section className="mt-6">
      <label
        className={`min-h-14 items-center gap-3 rounded-full border border-navy/30 bg-white/70 px-5 focus-within:border-navy ${
          boxOnPhoneOnly ? "flex lg:hidden" : "flex"
        }`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only">Album or artist</span>
        <input
          type="search"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Album or artist"
          autoComplete="off"
          className="w-full bg-transparent text-lg outline-none placeholder:text-navy/50"
        />
      </label>

      <div className={`relative mt-6 ${state.kind === "idle" && !nobodySelling ? "" : "min-h-40"}`}>
        {state.kind === "loading" && <LoadingMask label="Searching…" />}
        {state.kind === "error" && (
          <ErrorScreen message="We couldn't load the albums. Check your connection." onRetry={() => setAttempt((n) => n + 1)} />
        )}
        {nobodySelling && (
          <div role="status" className="mb-4 rounded-2xl border border-line bg-sand p-5 text-navy">
            <p className="font-heading text-2xl">Nobody is selling this album right now</p>
            <p className="mt-1 text-sm text-navy/80">
              {nobodySelling.title} · {nobodySelling.artist}
            </p>
          </div>
        )}
        {response && <Results response={response} mode={mode} onNobodySelling={setNobodySelling} />}
      </div>
    </section>
  );
}

export type RowProps = { mode: Mode; onNobodySelling: (a: AlbumSummary) => void };

function Results({ response, mode, onNobodySelling }: RowProps & { response: SearchResponse }) {
  const { albums, suggestions } = response;
  if (albums.length > 0) {
    return (
      <>
        <p className="mb-2 text-sm text-navy/70">
          {albums.length} {albums.length === 1 ? "album" : "albums"} found · Illustrative data
        </p>
        <ul aria-label="Search results" className="divide-y divide-line border-y border-line">
          {albums.map((a) => (
            <li key={a.id}>
              <AlbumRow album={a} mode={mode} onNobodySelling={onNobodySelling} />
            </li>
          ))}
        </ul>
      </>
    );
  }
  if (suggestions.length > 0) {
    return (
      <div>
        <p className="mb-2 font-medium">Did you mean…?</p>
        <ul aria-label="Search results" className="divide-y divide-line border-y border-line">
          {suggestions.map((a) => (
            <li key={a.id}>
              <AlbumRow album={a} mode={mode} onNobodySelling={onNobodySelling} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return <p className="font-medium">No albums found</p>;
}

export function AlbumRow({ album, mode, onNobodySelling }: RowProps & { album: AlbumSummary }) {
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={album.coverUrl} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-md" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug">{album.title}</span>
        <span className="block text-sm text-navy/70">
          {album.artist}, {album.releaseYear}
        </span>
        {mode === "buy" && album.access !== "open" && (
          <span className="mt-1 inline-block rounded-full border border-navy/30 px-2 py-0.5 text-xs">
            {album.access === "no_listings" ? "No listings" : "Not in the demo"}
          </span>
        )}
      </span>
      <span className="shrink-0 rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold">
        {album.versionCount} {album.versionCount === 1 ? "version" : "versions"}
      </span>
    </>
  );
  const rowClass = "flex min-h-20 w-full items-center gap-3 py-3 text-left";
  if (mode === "sell")
    return (
      <Link href={`/sell/albums/${album.id}`} className={rowClass}>
        {content}
      </Link>
    );
  // Only albums with recommendation data open (finding #50); "Not in the demo" rows do nothing.
  if (album.access === "open")
    return (
      <Link href={`/albums/${album.id}/priorities`} className={rowClass}>
        {content}
      </Link>
    );
  if (album.access === "not_in_demo") return <div className={rowClass}>{content}</div>;
  return (
    <button type="button" onClick={() => onNobodySelling(album)} className={rowClass}>
      {content}
    </button>
  );
}
