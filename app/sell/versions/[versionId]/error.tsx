"use client";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Header } from "@/components/Header";

// If the page fails to load (SPEC · Shared rules): plain-language message and "Try again".
export default function SellError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <ErrorScreen
        message="We couldn't load the sell form. Check your connection."
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
