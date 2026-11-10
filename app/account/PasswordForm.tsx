"use client";
// "Password" block on Your account (bug 9, design option A). Shows what the rules return; never checks anything itself.
import { useActionState, useState } from "react";
import { changePasswordAction, type PasswordState } from "./actions";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Field } from "@/components/Field";
import { LoadingMask } from "@/components/LoadingMask";
import { MIN_PASSWORD_LENGTH } from "@/lib/rules/signUp";

const initial: PasswordState = { status: "ready", errors: {} };

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  const [dismissed, setDismissed] = useState<PasswordState | null>(null);

  if (state.status === "failed" && dismissed !== state) {
    return (
      <section aria-label="Password" className="mt-6">
        <ErrorScreen message="We couldn't change your password." onRetry={() => setDismissed(state)} />
      </section>
    );
  }

  return (
    // A new key after a success empties the fields.
    <form key={state.status === "done" ? "done" : "form"} action={action} noValidate aria-label="Password" className="relative mt-6 rounded-2xl border border-line bg-white/60 p-5">
      {pending && <LoadingMask label="Saving…" />}
      <h2 className="font-heading text-2xl leading-tight">Password</h2>
      <div className="mt-3 space-y-4">
        <Field name="current" label="Current password" type="password" autoComplete="current-password" error={state.errors.current} />
        <Field
          name="next"
          label="New password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
          error={state.errors.next}
        />
      </div>
      {state.status === "done" && (
        <p role="status" className="mt-4 font-medium">Password changed.</p>
      )}
      <button type="submit" disabled={pending} className="mt-4 min-h-12 w-full rounded-full bg-navy px-6 font-semibold text-cream">
        Save password
      </button>
    </form>
  );
}
