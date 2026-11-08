"use client";
// "Log in" in the top-right corner when signed out (story 9). Carries the current page as ?next=,
// so the user comes back to it after logging in. Hidden on the log-in and sign-up pages themselves.
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { withReturn } from "@/lib/rules/login";

export function LogInLink() {
  const path = usePathname();
  const query = useSearchParams().toString();
  if (path === "/login" || path === "/signup") return null;
  return (
    <Link
      href={withReturn("/login", query ? `${path}?${query}` : path)}
      className="flex min-h-11 items-center rounded-full border border-navy bg-cream px-4 text-sm font-semibold"
    >
      Log in
    </Link>
  );
}
