"use client";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Header } from "@/components/Header";

// If the recommendation fails to load (SPEC · Shared rules): plain-language message and "Try again".
export default function RecommendationError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16">
      <Header />
      <ErrorScreen
        message="We couldn't load the recommendation. Check your connection."
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
