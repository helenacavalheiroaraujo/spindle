"use client";
// Sign-up form (story 9). Shows the messages the rules return; never checks anything itself.
import { useActionState, useState } from "react";
import { signUp, type SignUpState } from "./actions";
import { LoadingMask } from "@/components/LoadingMask";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Field } from "@/components/Field";

const initial: SignUpState = { errors: {}, failed: false, values: { name: "", email: "" } };

export function SignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUp, initial);
  // "Try again" hides this failure and shows the form; a new failure shows the error screen again.
  const [dismissed, setDismissed] = useState<SignUpState | null>(null);

  if (state.failed && dismissed !== state) {
    return <ErrorScreen message="We couldn't create your account." onRetry={() => setDismissed(state)} />;
  }

  return (
    <form action={action} noValidate className="relative mt-8 space-y-5">
      {pending && <LoadingMask label="Creating your account…" />}
      <input type="hidden" name="next" value={next} />
      <Field name="name" label="Name" autoComplete="name" defaultValue={state.values.name} error={state.errors.name} />
      <Field name="email" label="Email" type="email" autoComplete="email" defaultValue={state.values.email} error={state.errors.email} />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters"
        error={state.errors.password}
      />
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-full bg-navy px-6 font-semibold text-cream">
        Create account
      </button>
    </form>
  );
}
