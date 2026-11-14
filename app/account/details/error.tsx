"use client";
import { TabError } from "../TabStates";

// If the Account details tab fails to load (SPEC · Shared rules; story 31): plain-language message and "Try again".
export default function DetailsError({ reset }: { reset: () => void }) {
  return <TabError message="We couldn't load your account details. Check your connection." reset={reset} />;
}
