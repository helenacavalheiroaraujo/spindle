import Link from "next/link";
import { Header } from "@/components/Header";
import { returnPath, withReturn } from "@/lib/rules/login";
import { SignUpForm } from "./SignUpForm";

// Sign up (story 9 · use case 1): name, email and password; no terms line, no seller box (finding #23).
// ?next= is where the user was (e.g. Buy); it is kept when switching to log-in.
export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = returnPath((await searchParams).next);
  return (
    <main className="mx-auto max-w-md px-4 pb-16">
      <Header />
      <h1 className="mt-6 font-heading text-4xl leading-tight">Create your account</h1>
      <p className="mt-2">One account to buy and sell records.</p>
      <SignUpForm next={next} />
      <p className="mt-6 text-center">
        Already have an account?{" "}
        <Link href={withReturn("/login", next)} className="inline-block min-h-12 py-3 font-semibold underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
