"use client";
import { TabError } from "../TabStates";

// If the For sale tab fails to load (SPEC · Shared rules; story 31): plain-language message and "Try again".
export default function ForSaleError({ reset }: { reset: () => void }) {
  return <TabError message="We couldn't load your listings. Check your connection." reset={reset} />;
}
