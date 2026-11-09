"use client";
// Desktop only (story 12): the search sits in the header of every page. Typing and pressing Search opens the results
// page (story 17, "/search?q="). Not on the sell pages: selling has its own search
// (story 8 · finding #36).
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SuggestionList, useSuggestions } from "./SuggestionBox";

export function HeaderSearch() {
  const router = useRouter();
  const onSellPage = usePathname().startsWith("/sell");
  const [typed, setTyped] = useState(useSearchParams().get("q") ?? "");
  const box = useSuggestions(typed, "buy");
  if (onSellPage) return null;
  return (
    <div ref={box.wrapperRef} className="relative hidden min-w-0 flex-1 lg:block">
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(typed.trim())}`);
      }}
    >
      <label className="flex min-h-12 items-center gap-2 rounded-full border border-navy/40 bg-white/80 py-1 pl-5 pr-1 focus-within:border-navy">
        <span className="sr-only">Album or artist</span>
        <input
          type="search"
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            box.onTyped();
          }}
          {...box.inputProps}
          placeholder="Which record are you after?"
          autoComplete="off"
          className="w-full min-w-0 bg-transparent outline-none placeholder:text-navy/50"
        />
        <button type="submit" className="min-h-10 shrink-0 rounded-full bg-navy px-5 text-sm font-semibold text-cream">
          Search
        </button>
      </label>
    </form>
    <SuggestionList {...box.list} />
    </div>
  );
}
