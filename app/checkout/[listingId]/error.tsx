"use client";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Header } from "@/components/Header";

// If the checkout fails to load (SPEC · Shared rules): plain-language message and "Try again".
export default function CheckoutError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16">
      <Header />
      <ErrorScreen
        message="We couldn't load the checkout. Check your connection."
        onRetry={() =>
          startTransition(() => {
            router.refresh();
            reset();
          })
        }
      />
    </main>
  );
}
