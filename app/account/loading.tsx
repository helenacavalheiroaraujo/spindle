import { LoadingMask } from "@/components/LoadingMask";

// While Your account loads (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="relative min-h-96 px-4 page-main page-narrow">
      <LoadingMask label="Loading your account…" />
    </main>
  );
}
