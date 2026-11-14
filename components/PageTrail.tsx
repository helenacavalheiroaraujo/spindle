"use client";
// Remembers the previous Spindle page in this tab (story 29): closing the log-in window on a page that needs an account
// goes back to it, or home if there is none (gateCloseTarget). Kept in sessionStorage, so it lives as long as the tab
// and survives full page loads; if the browser blocks it, there is simply no previous page. Renders nothing.
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const CURRENT = "spindle:page";
const PREVIOUS = "spindle:previous-page";

export function PageTrail() {
  const path = usePathname();
  const query = useSearchParams().toString();
  useEffect(() => {
    const here = query ? `${path}?${query}` : path;
    try {
      const current = sessionStorage.getItem(CURRENT);
      if (current === here) return; // the same page again (a reload)
      if (current) sessionStorage.setItem(PREVIOUS, current);
      else sessionStorage.removeItem(PREVIOUS);
      sessionStorage.setItem(CURRENT, here);
    } catch {
      // storage blocked: no previous page
    }
  }, [path, query]);
  return null;
}

export function previousPage(): string | null {
  try {
    return sessionStorage.getItem(PREVIOUS);
  } catch {
    return null;
  }
}
