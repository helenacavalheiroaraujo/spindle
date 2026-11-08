"use client";
// Crates by genre and "This week at the shop" (story 12). Loaded on their own, with the shared loading mask and
// error screen, so a failure never hides the search.
import Link from "next/link";
import { useEffect, useState } from "react";
import { homeData, type HomeData } from "./actions";
import { Crate } from "@/components/Crate";
import { ErrorScreen } from "@/components/ErrorScreen";
import { LoadingMask } from "@/components/LoadingMask";
import { recordsLabel } from "@/lib/rules/home";

type State = { kind: "loading" } | { kind: "error" } | { kind: "ready"; data: HomeData };

export function HomeSections() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setState({ kind: "loading" });
    homeData()
      .then((data) => current && setState({ kind: "ready", data }))
      .catch(() => current && setState({ kind: "error" }));
    return () => {
      current = false;
    };
  }, [attempt]);

  return (
    <div className="relative mt-10 min-h-48">
      {state.kind === "loading" && <LoadingMask label="Loading the shop…" />}
      {state.kind === "error" && (
        <ErrorScreen message="We couldn't load the shop. Check your connection." onRetry={() => setAttempt((n) => n + 1)} />
      )}
      {state.kind === "ready" && <Sections data={state.data} />}
    </div>
  );
}

function Sections({ data }: { data: HomeData }) {
  const { featured } = data;
  return (
    <>
      {data.crates.length > 0 && (
        <section aria-labelledby="crates">
          <h2 id="crates" className="font-heading text-3xl">Pick a crate</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.crates.map(({ genre, count }) => (
              <li key={genre.slug}>
                <Link href={`/genres/${genre.slug}`} aria-label={`${genre.name}, ${recordsLabel(count)}`} className="block">
                  <Crate genre={genre} count={recordsLabel(count)} />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-navy/70">Illustrative data</p>
        </section>
      )}

      <section aria-labelledby="week" className="mt-10">
        <h2 id="week" className="font-heading text-3xl">This week at the shop</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-[3fr_2fr]">
          {featured && (
            <div className="grid gap-3 rounded-3xl bg-brown p-5 text-cream">
              <span className="w-fit rounded-full bg-cream px-3 py-1 text-xs font-semibold text-brown">This weekend</span>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.coverUrl} alt="" width={80} height={80} className="h-20 w-20 shrink-0 rounded-xl border border-cream/40" />
                <p className="min-w-0">
                  <span className="block font-semibold leading-snug lg:text-xl">{featured.title}</span>
                  <span className="mt-1 block text-sm opacity-90">
                    {featured.artist}, {featured.releaseYear} · verified copies for sale
                  </span>
                </p>
              </div>
              <Link
                href={`/albums/${featured.id}/priorities`}
                className="flex min-h-12 w-fit items-center rounded-full bg-cream px-6 font-semibold text-navy"
              >
                See which to buy
              </Link>
            </div>
          )}
          <div className="grid content-start gap-2 rounded-3xl border border-navy p-5">
            <span className="w-fit rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold">For sellers</span>
            <p className="text-lg font-semibold lg:text-xl">Sell for free</p>
            <p className="text-sm text-navy/70">0% commission: you keep the full price.</p>
            <Link href="/sell" className="mt-1 flex min-h-12 w-fit items-center rounded-full bg-navy px-6 font-semibold text-cream">
              Sell a record
            </Link>
          </div>
        </div>
        <p className="mt-2 text-xs text-navy/70">Illustrative data</p>
      </section>
    </>
  );
}
