"use client";
// Log in without leaving the page (story 27), in the larger two-panel window of story 29 (design B): the record, or what
// Spindle does (B1), on the left; the form on the right. Phone: the window fills the screen, the record panel above the
// form. Every log-in opens it: Buy, Continue to checkout, Add to cart, Sell, the cart icon, the menu "Log in", /login,
// /signup and every page that needs an account (LoginGate). It uses the same log-in and sign-up steps as before (same
// rules, same messages); then the original action goes on: the window opens `next` with a full page load. The browser's
// own modal window keeps the focus inside and closes on Esc.
import { useRouter } from "next/navigation";
import { createContext, useActionState, useCallback, useContext, useEffect, useRef, useState } from "react";
import { logInOnly, type LoginState } from "@/app/login/actions";
import { signUpOnly, type SignUpState } from "@/app/signup/actions";
import { ACCOUNT_NOT_CREATED } from "@/lib/rules/signUp";
import {
  gateCloseTarget,
  loginWindowText,
  PROMISE_HEADING,
  PROMISE_LINES,
  PROTECTION_LINE,
  type LoginMode,
  type LoginPurpose,
  type LoginRecord,
} from "@/lib/rules/loginWindow";
import { ErrorScreen } from "./ErrorScreen";
import { Field } from "./Field";
import { LoadingMask } from "./LoadingMask";
import { previousPage } from "./PageTrail";
import { useSignedIn } from "./SignedIn";

// mode: the form it opens with (/signup opens on "Create one").
// onClose: what closing without logging in does. "page" (default): nothing, the user stays on this page · "leave": a
// page that needs an account goes back, or home (story 29) · "home": /login and /signup show the home page's address.
// stay: logged in, the page stays as it is (only the header and the session are read again), so what was typed on it
// is kept: the session ended during a checkout (story 29 · Scope).
export type LoginRequest = {
  purpose: LoginPurpose;
  next: string;
  record?: LoginRecord;
  mode?: LoginMode;
  onClose?: "page" | "leave" | "home";
  stay?: boolean;
};

type Open = (request: LoginRequest, opener?: HTMLElement | null) => void;
const LoginWindowContext = createContext<Open>(() => {});
export const useLoginWindow = () => useContext(LoginWindowContext);

type Typed = { name: string; email: string; password: string };
const EMPTY: Typed = { name: "", email: "", password: "" };

export function LoginWindowProvider({ children }: { children: React.ReactNode }) {
  const signedIn = useSignedIn();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const loggedIn = useRef(false);
  const [request, setRequest] = useState<LoginRequest | null>(null);
  const [mode, setMode] = useState<LoginMode>("login");
  const [typed, setTyped] = useState<Typed>(EMPTY);

  const open = useCallback<Open>((next, from) => {
    opener.current = from ?? (document.activeElement as HTMLElement | null);
    loggedIn.current = false;
    setMode(next.mode ?? "login");
    setTyped(EMPTY);
    setRequest(next);
  }, []);

  useEffect(() => {
    if (request && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [request]);

  // Signed in some other way while the window is open (another tab), or logged in with `stay`: nothing left to do here.
  useEffect(() => {
    if (signedIn) {
      loggedIn.current = true;
      dialog.current?.close();
    }
  }, [signedIn]);

  function onClose() {
    const closed = request;
    setRequest(null);
    const back = opener.current;
    opener.current = null;
    if (!loggedIn.current && closed?.onClose === "leave") {
      const here = window.location.pathname + window.location.search;
      if (gateCloseTarget(previousPage(), here) === "back") window.history.back();
      else window.location.assign("/");
      return;
    }
    if (!loggedIn.current && closed?.onClose === "home") {
      router.replace("/");
      return;
    }
    if (back?.isConnected) back.focus();
  }

  // Logged in or signed up: the original action goes on with a full page load (see logInOnly), under the loading mask;
  // with `stay`, the window closes and the page is read again where it is (it still showed as signed in, so the
  // session check above never changes in that case).
  function goOn(done: string) {
    loggedIn.current = true;
    if (request?.stay) {
      dialog.current?.close();
      router.refresh();
    } else window.location.assign(done);
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
        // Phone: the whole screen. From 768 px: a centred window 880 px wide, the same height in every case (story 29).
        className="login-window m-0 h-[100dvh] max-h-none w-full max-w-none overflow-y-auto border-0 bg-cream p-0 text-navy backdrop:bg-navy/55 md:m-auto md:h-[min(600px,calc(100dvh-2rem))] md:w-[min(880px,calc(100%-2rem))] md:rounded-[28px] md:border md:border-line"
      >
        {request && text && (
          <div className="relative grid min-h-full grid-cols-1 content-start pb-8 md:grid-cols-[360px_1fr] md:grid-rows-[auto_1fr] md:content-stretch md:pb-0">
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none hover:bg-sand md:right-4 md:top-3.5"
            >
              ×
            </button>
            <div className="px-5 pt-5 md:col-start-2 md:row-start-1 md:px-10 md:pt-11">
              <h2 id="login-window-title" className="pr-12 font-heading text-4xl leading-tight md:text-[42px]">
                {text.title}
              </h2>
              {/* With a record, "You are buying:" heads the record panel instead (design B). */}
              {text.note && !request.record && <p className="mt-1 text-navy/70">{text.note}</p>}
            </div>
            <div className="mx-5 mt-4 md:col-start-1 md:row-span-2 md:row-start-1 md:m-0">
              {request.record ? <RecordPanel record={request.record} note={text.note} /> : <PromisePanel />}
            </div>
            <div className="px-5 md:col-start-2 md:row-start-2 md:px-10 md:pb-8">
              {mode === "login" ? (
                <WindowLogIn next={request.next} typed={typed} set={set} onSwitch={() => setMode("signup")} goOn={goOn} />
              ) : (
                <WindowSignUp next={request.next} typed={typed} set={set} onSwitch={() => setMode("login")} goOn={goOn} />
              )}
            </div>
          </div>
        )}
      </dialog>
    </LoginWindowContext.Provider>
  );
}

// Phone: a sand card above the form. Desktop: the sand left panel, full height (design B / B1).
const panel = "rounded-2xl border border-line bg-sand p-4 md:h-full md:rounded-none md:border-0 md:border-r md:p-8";

function RecordPanel({ record, note }: { record: LoginRecord; note: string | null }) {
  return (
    <div aria-label="Record" className={panel}>
      {note && <p className="mb-3 hidden text-sm text-navy/70 md:block">{note}</p>}
      <div className="flex items-start gap-3 md:block">
        {record.cover ? (
          <img src={record.cover} alt="" className="h-[88px] w-[88px] shrink-0 rounded-xl border border-line object-cover md:h-[200px] md:w-[200px]" />
        ) : (
          <span aria-hidden className="block h-[88px] w-[88px] shrink-0 rounded-xl border border-line bg-white/60 md:h-[200px] md:w-[200px]" />
        )}
        <p className="text-sm md:mt-4 md:text-base">
          <span className="font-semibold md:block md:font-heading md:text-3xl md:leading-tight">{record.title}</span>
          <span className="md:hidden"> · </span>
          <span className="md:mt-1 md:block">
            {record.version} · {record.condition}
          </span>
          <br className="md:hidden" />
          <span className="text-navy/70 md:block">{record.seller}</span>
          <span className="md:hidden"> · </span>
          <span className="font-bold md:mt-2 md:block md:text-2xl">{record.price}</span>
        </p>
      </div>
      <p className="mt-3 border-t border-line pt-2 text-sm md:mt-4 md:pt-3">{PROTECTION_LINE}</p>
    </div>
  );
}

function PromisePanel() {
  return (
    <div className={`${panel} md:flex md:flex-col md:gap-5`}>
      <p aria-hidden className="hidden items-center gap-3 font-heading text-3xl tracking-wide md:flex">
        <span className="h-7 w-7 rounded-full border-[7px] border-navy" />
        SPINDLE
      </p>
      <p className="hidden font-heading text-3xl leading-tight md:block">{PROMISE_HEADING}</p>
      <ol aria-label="What Spindle does" className="space-y-2 text-sm md:space-y-3 md:text-base">
        {PROMISE_LINES.map((line, i) => (
          <li key={line} className="flex items-start gap-3">
            <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy text-xs font-semibold">
              {i + 1}
            </span>
            {line}
          </li>
        ))}
      </ol>
    </div>
  );
}
// Name and email are left to the browser (defaultValue, not value): a value filled in by the browser or a password manager
// may not reach React, and a controlled field would then empty it on the next keystroke elsewhere (bug 30). What was typed
// still goes along when switching forms (typed), and after a failed try the form shows what was sent (state).
type FormProps = {
  next: string;
  typed: Typed;
  set: (field: keyof Typed) => (value: string) => void;
  onSwitch: () => void;
  goOn: (done: string) => void;
};

const submit = "min-h-12 md:min-h-14 w-full rounded-full bg-navy px-6 font-semibold text-cream";
const switchLink = "inline-flex min-h-11 items-center font-semibold underline underline-offset-4";

// Logged in or signed up: the original action goes on (goOn), under the loading mask.
function useGoOn(done: string | undefined, goOn: (done: string) => void) {
  useEffect(() => {
    if (done) goOn(done);
  }, [done]);
  return Boolean(done);
}

const loginStart: LoginState = { errors: {}, failed: false, email: "" };

function WindowLogIn({ next, typed, set, onSwitch, goOn }: FormProps) {
  const [state, action, pending] = useActionState(logInOnly, loginStart);
  const [dismissed, setDismissed] = useState<LoginState | null>(null);
  const leaving = useGoOn(state.done, goOn);

  if (state.failed && dismissed !== state) {
    return (
      <div className="mt-5">
        <ErrorScreen message="We couldn't log you in." onRetry={() => setDismissed(state)} />
      </div>
    );
  }
  return (
    <form action={action} noValidate className="relative mt-5 space-y-4 md:mt-6">
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

function WindowSignUp({ next, typed, set, onSwitch, goOn }: FormProps) {
  const [state, action, pending] = useActionState(signUpOnly, signUpStart);
  const [dismissed, setDismissed] = useState<SignUpState | null>(null);
  const leaving = useGoOn(state.done, goOn);

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
    <form action={action} noValidate className="relative mt-5 space-y-4 md:mt-6">
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
