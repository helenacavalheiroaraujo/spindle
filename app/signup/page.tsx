import { redirect } from "next/navigation";
import Home from "@/app/page";
import { LoginGate } from "@/components/LoginGate";
import { currentUserId } from "@/lib/db/session";
import { returnPath } from "@/lib/rules/login";

// /signup (story 29 · Scope): the separate sign-up page is gone; the home page opens with the log-in window on top, in
// its "Create one" state. ?next= is still where the user goes after signing up. Already signed in: straight there.
export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = returnPath((await searchParams).next);
  if (await currentUserId().catch(() => null)) redirect(next);
  return (
    <>
      <Home />
      <LoginGate purpose="menu" next={next} mode="signup" onClose="home" />
    </>
  );
}
