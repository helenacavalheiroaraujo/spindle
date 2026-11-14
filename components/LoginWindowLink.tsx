"use client";
// A link that, when signed out, opens the log-in window instead of leaving the page (story 27): "Sell" and the "Log in"
// link. Signed in, or with JavaScript off, it is an ordinary link (the pages still ask for log-in themselves).
import Link from "next/link";
import type { ComponentProps } from "react";
import { loginWindowNext, menuLoginPurpose } from "@/lib/rules/loginWindow";
import { useLoginWindow } from "./LoginWindow";
import { useSignedIn } from "./SignedIn";

type Props = ComponentProps<typeof Link> & {
  href: string;
  // Runs before the window opens (the phone menu closes itself) and says where the focus goes back when the window
  // closes; without it, back to this link.
  beforeOpen?: () => HTMLElement | null;
};

export function LoginWindowLink({ href, beforeOpen, onClick, ...rest }: Props) {
  const signedIn = useSignedIn();
  const openLogin = useLoginWindow();
  const purpose = menuLoginPurpose(signedIn, href);

  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (!purpose || e.defaultPrevented) return;
        e.preventDefault();
        const link = e.currentTarget;
        const back = beforeOpen ? beforeOpen() : link;
        const here = window.location.pathname + window.location.search;
        openLogin({ purpose, next: loginWindowNext(purpose, here) }, back);
      }}
      {...rest}
    />
  );
}
