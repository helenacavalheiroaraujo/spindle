import { LoadingMask } from "@/components/LoadingMask";

// While the recommendation loads (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="relative mx-auto min-h-96 max-w-2xl px-4">
      <LoadingMask label="Finding your pressing…" />
    </main>
  );
}
