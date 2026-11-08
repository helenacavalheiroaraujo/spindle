"use client";
// The search box on the page (phone only, story 17): typing and pressing Search or Enter opens /search?q=…
// On desktop the search lives in the header (HeaderSearch), so this one is hidden there.
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [typed, setTyped] = useState(initial);
  return (
    <form
      role="search"
      className="lg:hidden"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(typed.trim())}`);
      }}
    >
      <label className="flex min-h-14 items-center gap-2 rounded-full border border-navy/30 bg-white/70 py-1 pl-5 pr-1 focus-within:border-navy">
        <span className="sr-only">Album or artist</span>
        <input
          type="search"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Album or artist"
          autoComplete="off"
          className="w-full min-w-0 bg-transparent text-lg outline-none placeholder:text-navy/50"
        />
        <button type="submit" className="min-h-12 shrink-0 rounded-full bg-navy px-5 text-sm font-semibold text-cream">
          Search
        </button>
      </label>
    </form>
  );
}
