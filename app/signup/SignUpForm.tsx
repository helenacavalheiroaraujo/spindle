"use client";
// Sign-up form (story 9). Shows the messages the rules return; never checks anything itself.
import { useActionState, useState } from "react";
import { signUp, type SignUpState } from "./actions";
import { LoadingMask } from "@/components/LoadingMask";
import { ErrorScreen } from "@/components/ErrorScreen";

const initial: SignUpState = { errors: {}, failed: false, values: { name: "", email: "" } };

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initial);
  // "Try again" hides this failure and shows the form; a new failure shows the error screen again.
  const [dismissed, setDismissed] = useState<SignUpState | null>(null);

  if (state.failed && dismissed !== state) {
    return <ErrorScreen message="We couldn't create your account." onRetry={() => setDismissed(state)} />;
  }

  return (
    <form action={action} noValidate className="relative mt-8 space-y-5">
      {pending && <LoadingMask label="Creating your account…" />}
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

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  hint,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete: string;
  defaultValue?: string;
  hint?: string;
  error?: string;
}) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div>
      <label htmlFor={name} className="block font-medium">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1 min-h-12 w-full rounded-2xl border bg-white/70 px-4 ${error ? "border-red-700" : "border-line"}`}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-sm font-medium text-red-800">{error}</p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-1 text-sm text-navy/70">{hint}</p>
      ) : null}
    </div>
  );
}
