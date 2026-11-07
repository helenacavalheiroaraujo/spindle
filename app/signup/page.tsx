import { Header } from "@/components/Header";
import { SignUpForm } from "./SignUpForm";

// Sign up (story 9 · use case 1): name, email and password; no terms line, no seller box (finding #23).
export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-md px-4 pb-16">
      <Header />
      <h1 className="mt-6 font-heading text-4xl leading-tight">Create your account</h1>
      <p className="mt-2">One account to buy and sell records.</p>
      <SignUpForm />
    </main>
  );
}
