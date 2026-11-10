"use client";
import { useState, useTransition } from "react";
import { removeListingFromCart } from "./actions";
import { ErrorScreen } from "@/components/ErrorScreen";

// "Remove" on a record of the cart (story 20 · use case 3). The screen is refreshed by the action, so the record
// and the total update; a failure shows the shared error screen with "Try again".
export function RemoveButton({ listingId, title }: { listingId: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  function remove() {
    start(async () => {
      setFailed((await removeListingFromCart(listingId)) === "failed");
    });
  }

  if (failed) return <ErrorScreen message="We couldn't remove it from your cart." onRetry={remove} />;
  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      aria-label={`Remove ${title} from your cart`}
      className="min-h-12 rounded-full px-3 text-sm font-semibold underline underline-offset-4 disabled:opacity-60"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
