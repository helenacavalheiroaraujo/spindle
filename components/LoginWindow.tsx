"use client";
// Log in without leaving the page (story 27, design option A). Buy, Continue to checkout, Add to cart, Sell and the menu
// "Log in" open this window when signed out. It uses the same log-in and sign-up steps as the pages (same rules, same
// messages); then the original action goes on: the window opens `next` with a full page load. Phone: a sheet from the bottom; from
// 640 px: a centred window. The browser's own modal window keeps the focus inside and closes on Esc.
import { createContext, useActionState, useCallback, useContext, useEffect, useRef, useState } from "react";
import { logInOnly, type LoginState } from "@/app/login/actions";
import { signUpOnly, type SignUpState } from "@/app/signup/actions";
import { ACCOUNT_NOT_CREATED } from "@/lib/rules/signUp";
import { loginWindowText, type LoginMode, type LoginPurpose, type LoginRecord } from "@/lib/rules/loginWindow";
import { ErrorScreen } from "./ErrorScreen";
import { Field } from "./Field";
import { LoadingMask } from "./LoadingMask";
import { useSignedIn } from "./SignedIn";

export type LoginRequest = { purpose: LoginPurpose; next: string; record?: LoginRecord };

type Open = (request: LoginRequest, opener?: HTMLElement | null) => void;
const LoginWindowContext = createContext<Open>(() => {});
export const useLoginWindow = () => useContext(LoginWindowContext);

type Typed = { name: string; email: string; password: string };
const EMPTY: Typed = { name: "", email: "", password: "" };

export function LoginWindowProvider({ children }: { children: React.ReactNode }) {
  const signedIn = useSignedIn();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [request, setRequest] = useState<LoginRequest | null>(null);
  const [mode, setMode] = useState<LoginMode>("login");
  const [typed, setTyped] = useState<Typed>(EMPTY);

  const open = useCallback<Open>((next, from) => {
    opener.current = from ?? (document.activeElement as HTMLElement | null);
    setMode("login");
    setTyped(EMPTY);
    setRequest(next);
  }, []);

  useEffect(() => {
    if (request && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [request]);

  // Signed in some other way while the window is open (another tab): nothing left to do here.
  useEffect(() => {
    if (signedIn) dialog.current?.close();
  }, [signedIn]);

  function onClose() {
    setRequest(null);
    const back = opener.current;
    opener.current = null;
    if (back?.isConnected) back.focus();
  }

  // Tab and Shift+Tab go round inside the window (the browser alone would let the focus leave it for its own toolbar).
  function keepFocus(e: React.KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== "Tab") return;
    const focusable = e.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not([type=hidden]), a[href]");
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else {
      // Safari only tabs through text fields by default, so "last" may never get the focus: if it left, bring it back.
      const box = e.currentTarget;
      const back = e.shiftKey ? last : first;
      setTimeout(() => {
        if (box.open && !box.contains(document.activeElement)) back.focus();
      });
    }
  }

  const text = request ? loginWindowText(request.purpose, mode) : null;
  const set = (field: keyof Typed) => (value: string) => setTyped((t) => ({ ...t, [field]: value }));

  return (
    <LoginWindowContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        aria-labelledby="login-window-title"
        onClose={onClose}
        onKeyDown={keepFocus}
        // A tap on the dimmed area (the dialog element itself, outside its inner box) closes the window.
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="login-window fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-b-0 border-line bg-cream p-0 text-navy backdrop:bg-navy/55 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md sm:rounded-3xl sm:border-b"
      >
        {request && text && (
          <div className="relative p-5 pb-8 sm:p-6">
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-navy/30 sm:hidden" />
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none hover:bg-sand"
            >
              ×
            </button>
            <h2 id="login-window-title" className="pr-12 font-heading text-3xl leading-tight">
              {text.title}
            </h2>
            {text.note && <p className="mt-1 text-sm text-navy/70">{text.note}</p>}
            {request.record && <RecordSummary record={request.record} />}
            {mode === "login" ? (
              <WindowLogIn next={request.next} typed={typed} set={set} onSwitch={() => setMode("signup")} />
            ) : (
              <WindowSignUp next={request.next} typed={typed} set={set} onSwitch={() => setMode("login")} />
            )}
          </div>
        )}
      </dialog>
    </LoginWindowContext.Provider>
  );
}

function RecordSummary({ record }: { record: LoginRecord }) {
  return (
    <div aria-label="Record" className="mt-3 rounded-2xl border border-line bg-sand px-4 py-3 text-sm">
      <p>
        <span className="font-semibold">{record.title}</span> · {record.version} · {record.condition}
      </p>
      <p>
        {record.seller} · <span className="font-bold">{record.price}</span>
      </p>
    </div>
  );
}

// Name and email are left to the browser (defaultValue, not value): a value filled in by the browser or a password manager
// may not reach React, and a controlled field would then empty it on the next keystroke elsewhere (bug 30). What was typed
// still goes along when switching forms (typed), and after a failed try the form shows what was sent (state).
type FormProps = { next: string; typed: Typed; set: (field: keyof Typed) => (value: string) => void; onSwitch: () => void };

const submit = "min-h-12 w-full rounded-full bg-navy px-6 font-semibold text-cream";
const switchLink = "inline-flex min-h-11 items-center font-semibold underline underline-offset-4";

// Logged in or signed up: the original action goes on with a full page load (see logInOnly), under the loading mask.
function useGoOn(done: string | undefined) {
  useEffect(() => {
    if (done) window.location.assign(done);
  }, [done]);
  return Boolean(done);
}

const loginStart: LoginState = { errors: {}, failed: false, email: "" };

function WindowLogIn({ next, typed, set, onSwitch }: FormProps) {
  const [state, action, pending] = useActionState(logInOnly, loginStart);
  const [dismissed, setDismissed] = useState<LoginState | null>(null);
  const leaving = useGoOn(state.done);

  if (state.failed && dismissed !== state) {
    return (
      <div className="mt-5">
        <ErrorScreen message="We couldn't log you in." onRetry={() => setDismissed(state)} />
      </div>
    );
  }
  return (
    <form action={action} noValidate className="relative mt-5 space-y-4">
      {(pending || leaving) && <LoadingMask label="Logging you in…" />}
      <input type="hidden" name="next" value={next} />
      {state.errors.form && (
        <p role="alert" className="rounded-2xl border border-red-700 bg-white/70 px-4 py-3 font-medium text-red-800">
          {state.errors.form}
        </p>
      )}
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        defaultValue={state.email || typed.email}
        onChange={set("email")}
        error={state.errors.email}
      />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={typed.password}
        onChange={set("password")}
        error={state.errors.password}
      />
      <button type="submit" disabled={pending || leaving} className={submit}>
        Log in
      </button>
      <p className="text-center text-sm">
        No account?{" "}
        <button type="button" onClick={onSwitch} className={switchLink}>
          Create one
        </button>
      </p>
    </form>
  );
}

const signUpStart: SignUpState = { errors: {}, failed: false, checkEmail: false, values: { name: "", email: "" } };

function WindowSignUp({ next, typed, set, onSwitch }: FormProps) {
  const [state, action, pending] = useActionState(signUpOnly, signUpStart);
  const [dismissed, setDismissed] = useState<SignUpState | null>(null);
  const leaving = useGoOn(state.done);

  if (state.failed && dismissed !== state) {
    return (
      <div className="mt-5">
        <ErrorScreen message="We couldn't create your account." onRetry={() => setDismissed(state)} />
      </div>
    );
  }
  if (state.checkEmail && dismissed !== state) {
    return (
      <div role="status" className="mt-5 space-y-4 rounded-2xl border border-navy/15 bg-sand p-5">
        <p className="font-heading text-2xl">{ACCOUNT_NOT_CREATED}</p>
        <p className="text-sm">
          Already registered?{" "}
          <button type="button" onClick={onSwitch} className={switchLink}>
            Log in
          </button>
        </p>
      </div>
    );
  }
  return (
    <form action={action} noValidate className="relative mt-5 space-y-4">
      {(pending || leaving) && <LoadingMask label="Creating your account…" />}
      <input type="hidden" name="next" value={next} />
      <Field name="name" label="Name" autoComplete="name" defaultValue={state.values.name || typed.name} onChange={set("name")} error={state.errors.name} />
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        defaultValue={state.values.email || typed.email}
        onChange={set("email")}
        error={state.errors.email}
      />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters"
        value={typed.password}
        onChange={set("password")}
        error={state.errors.password}
      />
      <button type="submit" disabled={pending || leaving} className={submit}>
        Create account
      </button>
      <p className="text-center text-sm">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className={switchLink}>
          Log in
        </button>
      </p>
    </form>
  );
}
