import { LoadingMask } from "@/components/LoadingMask";

// While My listings load (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="relative mx-auto min-h-96 max-w-2xl px-4">
      <LoadingMask label="Loading your listings…" />
    </main>
  );
}
