"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";

// If the search fails (SPEC · Shared rules): plain-language message and "Try again"; the typed text stays in the box.
export default function SearchError({ reset }: { reset: () => void }) {
  const router = useRouter();
  const typed = useSearchParams().get("q") ?? "";
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 lg:max-w-3xl">
      <Header />
      <SearchBox initial={typed} />
      <div className="mt-6">
        <ErrorScreen
          message="We couldn't load the albums. Check your connection."
          onRetry={() =>
            startTransition(() => {
              router.refresh();
              reset();
            })
          }
        />
      </div>
    </main>
  );
}
