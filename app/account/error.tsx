"use client";
import { TabError } from "./TabStates";

// If the Orders tab fails to load (SPEC · Shared rules; story 31): plain-language message and "Try again".
export default function AccountError({ reset }: { reset: () => void }) {
  return <TabError message="We couldn't load your orders. Check your connection." reset={reset} />;
}
