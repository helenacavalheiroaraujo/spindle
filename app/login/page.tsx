import Link from "next/link";
import { Header } from "@/components/Header";
import { BackLink } from "@/components/BackLink";
import { returnPath, withReturn } from "@/lib/rules/login";
import { LoginForm } from "./LoginForm";

// Log in (story 9 · use case 2). Its own page, linked to sign-up (DECISIONS · story 9).
// ?next= is where the user was (e.g. Buy); it is kept when switching to sign-up.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = returnPath((await searchParams).next);
  return (
    <main className="px-4 pb-16 page-main page-form">
      <Header />
      <BackLink href="/">Back to search</BackLink>
      <h1 className="mt-6 font-heading text-4xl leading-tight">Log in</h1>
      <p className="mt-2">Welcome back. Log in to buy and sell records.</p>
      <LoginForm next={next} />
      <p className="mt-6 text-center">
        No account?{" "}
        <Link href={withReturn("/signup", next)} className="inline-block min-h-12 py-3 font-semibold underline">
          Create one
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-navy/70">
        Just browsing? You can search and get recommendations without an account.
      </p>
    </main>
  );
}
