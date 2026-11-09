import { LoadingMask } from "@/components/LoadingMask";

// While the results load (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="relative min-h-96 px-4 page-main page-mid">
      <LoadingMask label="Searching…" />
    </main>
  );
}
