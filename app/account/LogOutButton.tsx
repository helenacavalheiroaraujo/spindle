"use client";
// Log out button on Your account (story 9). Shared loading mask and error screen (CLAUDE.md).
import { useActionState, useState } from "react";
import { logOutAction, type LogOutState } from "./actions";
import { LoadingMask } from "@/components/LoadingMask";
import { ErrorScreen } from "@/components/ErrorScreen";

const initial: LogOutState = { failed: false };

export function LogOutButton() {
  const [state, action, pending] = useActionState(logOutAction, initial);
  const [dismissed, setDismissed] = useState<LogOutState | null>(null);

  if (state.failed && dismissed !== state) {
    return <ErrorScreen message="We couldn't log you out." onRetry={() => setDismissed(state)} />;
  }

  return (
    <form action={action} className="relative mt-8">
      {pending && <LoadingMask label="Logging you out…" />}
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-full border border-navy px-6 font-semibold">
        Log out
      </button>
    </form>
  );
}
