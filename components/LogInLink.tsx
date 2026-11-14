"use client";
// "Log in" in the top-right corner when signed out (story 9). Opens the log-in window, and the user stays on this page
// (story 27); the link still carries the current page as ?next= for when JavaScript is off. Hidden on the log-in and
// sign-up pages themselves.
import { LoginWindowLink } from "./LoginWindowLink";
import { usePathname, useSearchParams } from "next/navigation";
import { withReturn } from "@/lib/rules/login";

export function LogInLink() {
  const path = usePathname();
  const query = useSearchParams().toString();
  if (path === "/login" || path === "/signup") return null;
  return (
    <LoginWindowLink
      href={withReturn("/login", query ? `${path}?${query}` : path)}
      className="flex min-h-11 items-center rounded-full border border-navy bg-cream px-4 text-sm font-semibold"
    >
      Log in
    </LoginWindowLink>
  );
}
