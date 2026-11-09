import { LoadingMask } from "@/components/LoadingMask";

// While the listings load (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="relative min-h-96 px-4 page-main page-narrow">
      <LoadingMask label="Checking listings…" />
    </main>
  );
}
