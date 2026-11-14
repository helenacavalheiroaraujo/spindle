"use client";
// Opens the log-in window as soon as the page shows (story 29). Used by SignInRequired (a page that needs an account,
// opened signed out) and by /login and /signup (the home page with the window on top). Renders nothing itself.
import { useEffect } from "react";
import type { LoginMode, LoginPurpose, LoginRecord } from "@/lib/rules/loginWindow";
import { useLoginWindow, type LoginRequest } from "./LoginWindow";

export function LoginGate({
  purpose,
  next,
  record,
  mode = "login",
  onClose = "leave",
}: {
  purpose: LoginPurpose;
  next?: string; // where to go after logging in; this page when left out
  record?: LoginRecord;
  mode?: LoginMode;
  onClose?: LoginRequest["onClose"];
}) {
  const openLogin = useLoginWindow();
  useEffect(() => {
    const here = window.location.pathname + window.location.search;
    openLogin({ purpose, next: next ?? here, record, mode, onClose }, null);
  }, []);
  return null;
}
