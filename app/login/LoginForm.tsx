"use client";
// Log-in form (story 9). Shows the messages the rules return; never checks anything itself.
import { useActionState, useState } from "react";
import { logIn, type LoginState } from "./actions";
import { LoadingMask } from "@/components/LoadingMask";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Field } from "@/components/Field";

const initial: LoginState = { errors: {}, failed: false, email: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(logIn, initial);
  // "Try again" hides this failure and shows the form; a new failure shows the error screen again.
  const [dismissed, setDismissed] = useState<LoginState | null>(null);

  if (state.failed && dismissed !== state) {
    return <ErrorScreen message="We couldn't log you in." onRetry={() => setDismissed(state)} />;
  }

  return (
    <form action={action} noValidate className="relative mt-8 space-y-5">
      {pending && <LoadingMask label="Logging you in…" />}
      <input type="hidden" name="next" value={next} />
      {state.errors.form && (
        <p role="alert" className="rounded-2xl border border-red-700 bg-white/70 px-4 py-3 font-medium text-red-800">
          {state.errors.form}
        </p>
      )}
      <Field name="email" label="Email" type="email" autoComplete="email" defaultValue={state.email} error={state.errors.email} />
      <Field name="password" label="Password" type="password" autoComplete="current-password" error={state.errors.password} />
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-full bg-navy px-6 font-semibold text-cream">
        Log in
      </button>
    </form>
  );
}
