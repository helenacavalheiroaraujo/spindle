import { LoadingMask } from "@/components/LoadingMask";

// While the checkout loads (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="relative mx-auto min-h-96 max-w-5xl px-4">
      <LoadingMask label="Loading the checkout…" />
    </main>
  );
}
