"use client";
// Crates by genre and "This week at the shop" (story 12). Loaded on their own, with the shared loading mask and
// error screen, so a failure never hides the search.
import Link from "next/link";
import { useEffect, useState } from "react";
import { homeData, type HomeData } from "./actions";
import { CrateRow } from "@/components/CrateRow";
import { ErrorScreen } from "@/components/ErrorScreen";
import { LoadingMask } from "@/components/LoadingMask";
import { LoginWindowLink } from "@/components/LoginWindowLink";

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
        <section aria-label="Pick a crate">
          <CrateRow crates={data.crates} />
          <p className="mt-2 text-xs text-navy/70">Illustrative data</p>
        </section>
      )}

      <section aria-labelledby="week" className="mt-10">
        <h2 id="week" className="font-heading text-3xl lg:text-4xl">This week at the shop</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-[13fr_7fr]">
          {featured && (
            <Link href={`/albums/${featured.id}/priorities`} className="card-link">
              <div className="grid h-full grid-cols-[1.35fr_1fr] overflow-hidden rounded-3xl bg-navy text-cream">
                <div className="flex flex-col items-start gap-3 p-5 lg:p-7">
                  <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-navy">This weekend</span>
                  <p className="font-heading text-2xl leading-none sm:text-3xl lg:text-4xl">{featured.title}</p>
                  <p className="text-sm text-cream/80">
                    {featured.artist}, {featured.releaseYear} · verified copies for sale
                  </p>
                  <span
                    data-card-cta
                    className="mt-auto flex min-h-12 items-center whitespace-nowrap rounded-full bg-cream px-4 text-sm font-semibold text-navy sm:px-6 sm:text-base"
                  >
                    See which to buy
                  </span>
                </div>
                <div className="flex items-center justify-center bg-[#e6dccb] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.coverUrl} alt="" width={160} height={160} className="aspect-square w-full max-w-40 rounded-xl" />
                </div>
              </div>
            </Link>
          )}
          {/* Signed out: opens the log-in window (story 27). */}
          <LoginWindowLink href="/sell" className="card-link">
            <div className="flex h-full flex-col justify-between gap-6 rounded-3xl bg-[#e6d8bf] p-5 lg:p-7">
              <span className="w-fit rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold">For sellers</span>
              <p className="font-heading text-3xl leading-none lg:text-4xl">
                <span className="block">Sell for free.</span>
                <span className="block">0% commission.</span>
              </p>
              <span data-card-cta-navy className="flex min-h-12 w-fit items-center rounded-full bg-navy px-6 font-semibold text-cream">
                Sell a record
              </span>
            </div>
          </LoginWindowLink>
        </div>
        <p className="mt-2 text-xs text-navy/70">Illustrative data</p>
      </section>
    </>
  );
}
