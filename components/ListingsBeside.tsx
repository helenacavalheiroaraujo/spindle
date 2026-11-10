"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { versionListings } from "@/app/actions";
import type { ListingDetails } from "@/lib/db/listings";
import type { Priority } from "@/lib/rules/priorities";
import type { TypicalRange } from "@/lib/rules/fairPrice";
import { ErrorScreen } from "./ErrorScreen";
import { ListingList } from "./ListingList";
import { LoadingMask } from "./LoadingMask";

// Desktop only (from 1024 px, DECISIONS.md): the listings beside the recommendation, with their own
// loading mask and error screen (SPEC · Shared rules), so a failure never hides the recommendation.
const DESKTOP = "(min-width: 1024px)";

type State = { kind: "loading" } | { kind: "error" } | { kind: "ready"; listings: ListingDetails[]; viewerId: string | null };

export function ListingsBeside({
  versionId,
  ranking,
  typicalRange,
  compareHref = null,
  priceBar = false,
}: {
  versionId: string;
  ranking: Priority[];
  typicalRange: TypicalRange;
  compareHref?: string | null; // "Compare pressings" under the listings (recommendation screen, design option A); null = none
  priceBar?: boolean; // the fair price bar (recommendation screen only)
}) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!window.matchMedia(DESKTOP).matches) return; // phone: "See verified listings" opens them instead
    let current = true;
    setState({ kind: "loading" });
    versionListings(versionId)
      .then(({ listings, viewerId }) => current && setState({ kind: "ready", listings, viewerId }))
      .catch(() => current && setState({ kind: "error" }));
    return () => {
      current = false;
    };
  }, [versionId, attempt]);

  return (
    <aside aria-label="Verified listings for this version" className="relative hidden min-h-96 lg:block">
      {state.kind === "loading" && <LoadingMask label="Checking listings…" />}
      {state.kind === "error" && (
        <ErrorScreen message="We couldn't load the listings. Check your connection." onRetry={() => setAttempt((n) => n + 1)} />
      )}
      {state.kind === "ready" && (
        <>
          <ListingList
            versionId={versionId}
            listings={state.listings}
            typicalRange={typicalRange}
            ranking={ranking}
            from="recommendation"
            Heading="h2"
            viewerId={state.viewerId}
            priceBar={priceBar}
          />
          {compareHref && (
            <Link href={compareHref} className="mt-6 flex min-h-14 items-center justify-center rounded-full border border-navy px-6 text-lg font-semibold">
              Compare pressings
            </Link>
          )}
        </>
      )}
    </aside>
  );
}
