import { LoadingMask } from "@/components/LoadingMask";

// While the recommendation loads (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="relative min-h-96 px-4 page-main">
      <LoadingMask label="Finding your pressing…" />
    </main>
  );
}
