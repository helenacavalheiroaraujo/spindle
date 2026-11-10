"use client";
// Desktop only (stories 12, 19): the search sits in the header. On the home page it has its own row under the logo and
// the menu; on every other page it sits in the top row between the logo and the menu (from 1280 px; under that it keeps
// the second row), as wide as fits. Typing and
// pressing Search opens the results page (story 17, "/search?q="). Not on the sell pages: selling has its own search
// (story 8 · finding #36).
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SuggestionList, useSuggestions } from "./SuggestionBox";

export function HeaderSearch({ placement }: { placement: "top" | "below" }) {
  const router = useRouter();
  const path = usePathname();
  const [typed, setTyped] = useState(useSearchParams().get("q") ?? "");
  const box = useSuggestions(typed);
  const onHome = path === "/";
  // "below": the second row, on the home page, and on the other pages too under 1280 px, where the top row has no room.
  // "top": between the logo and the menu, on every page but the home page, from 1280 px. Nothing on the sell pages.
  if (path.startsWith("/sell") || (placement === "top" && onHome)) return null;
  const top = placement === "top";
  const search = (
    <div ref={box.wrapperRef} className={`relative min-w-0 flex-1 ${top ? "hidden xl:mx-4 xl:block" : "hidden lg:block"}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(typed.trim())}`);
        }}
      >
        <label
          className={`flex items-center gap-2 rounded-full border border-navy/40 bg-white/80 py-1 pl-5 pr-1 focus-within:border-navy ${
            top ? "min-h-11" : "min-h-12 lg:min-h-[52px]"
          }`}
        >
          <span className="sr-only">Album or artist</span>
          <input
            type="search"
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              box.onTyped();
            }}
            {...box.inputProps}
            placeholder={top ? "Search records" : "Which record are you after?"}
            autoComplete="off"
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-navy/50"
          />
          {top ? (
            // Narrow search in the top row: the button is a magnifier, to leave room for what is typed.
            <button type="submit" aria-label="Search" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-cream">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </button>
          ) : (
            <button type="submit" className="min-h-9 shrink-0 rounded-full bg-navy px-5 text-sm font-semibold text-cream">
              Search
            </button>
          )}
        </label>
      </form>
      <SuggestionList {...box.list} wide={top} />
    </div>
  );
  return top ? search : <div className={`hidden lg:flex lg:h-16 lg:items-center ${onHome ? "" : "xl:hidden"}`}>{search}</div>;
}
