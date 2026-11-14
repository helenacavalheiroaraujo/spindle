import { redirect } from "next/navigation";
import Home from "@/app/page";
import { LoginGate } from "@/components/LoginGate";
import { currentUserId } from "@/lib/db/session";
import { returnPath } from "@/lib/rules/login";

// /login (story 29 · Scope): the separate log-in page is gone; the home page opens with the log-in window on top.
// ?next= (links from before story 29) is still where the user goes after logging in. Already signed in: straight there.
// Closing the window leaves the home page, with its own address.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = returnPath((await searchParams).next);
  if (await currentUserId().catch(() => null)) redirect(next);
  return (
    <>
      <Home />
      <LoginGate purpose="menu" next={next} mode="login" onClose="home" />
    </>
  );
}
