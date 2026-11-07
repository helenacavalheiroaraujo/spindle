"use client";
import { useEffect, useState } from "react";
import { versionListings } from "@/app/actions";
import type { ListingDetails } from "@/lib/db/listings";
import type { Priority } from "@/lib/rules/priorities";
import { ErrorScreen } from "./ErrorScreen";
import { ListingList } from "./ListingList";
import { LoadingMask } from "./LoadingMask";

// Desktop only (from 1024 px, DECISIONS.md): the listings beside the recommendation, with their own
// loading mask and error screen (SPEC · Shared rules), so a failure never hides the recommendation.
const DESKTOP = "(min-width: 1024px)";

type State = { kind: "loading" } | { kind: "error" } | { kind: "ready"; listings: ListingDetails[] };

export function ListingsBeside({ versionId, ranking }: { versionId: string; ranking: Priority[] }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!window.matchMedia(DESKTOP).matches) return; // phone: "See verified listings" opens them instead
    let current = true;
    setState({ kind: "loading" });
    versionListings(versionId)
      .then((listings) => current && setState({ kind: "ready", listings }))
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
        <ListingList versionId={versionId} listings={state.listings} ranking={ranking} from="recommendation" Heading="h2" />
      )}
    </aside>
  );
}
