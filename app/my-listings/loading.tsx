import { LoadingMask } from "@/components/LoadingMask";

// While My listings load (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="relative min-h-96 px-4 page-main">
      <LoadingMask label="Loading your listings…" />
    </main>
  );
}
