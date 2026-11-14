"use client";
// Loading mask and error screen for one tab of Your account (story 31 · Shared rules). The profile header and the
// tabs (layout) stay; only the tab's area shows the mask or the error with "Try again".
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";
import { LoadingMask } from "@/components/LoadingMask";

export function TabLoading({ label }: { label: string }) {
  return (
    <div className="relative mt-4 min-h-96">
      <LoadingMask label={label} />
    </div>
  );
}

export function TabError({ message, reset }: { message: string; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="mt-6">
      <ErrorScreen
        message={message}
        onRetry={() =>
          startTransition(() => {
            router.refresh();
            reset();
          })
        }
      />
    </div>
  );
}
