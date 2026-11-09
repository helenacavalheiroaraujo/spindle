import { LoadingMask } from "@/components/LoadingMask";

// While the page loads (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="relative min-h-96 px-4 page-main">
      <LoadingMask />
    </main>
  );
}
