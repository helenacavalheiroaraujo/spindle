"use client";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Header } from "@/components/Header";

// If the order fails to load (SPEC · Shared rules): plain-language message and "Try again".
export default function OrderError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <Header />
      <ErrorScreen
        message="We couldn't load your order. Check your connection."
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
