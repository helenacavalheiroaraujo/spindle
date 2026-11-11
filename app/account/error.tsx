"use client";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Header } from "@/components/Header";

// If Your account fails to load (SPEC · Shared rules): plain-language message and "Try again".
export default function AccountError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <ErrorScreen
        message="We couldn't load your account. Check your connection."
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
