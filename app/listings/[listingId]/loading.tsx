import { Header } from "@/components/Header";
import { LoadingMask } from "@/components/LoadingMask";

// While the listing check loads (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="px-4 pb-16 page-main page-narrow">
      <Header />
      <div className="relative min-h-96">
        <LoadingMask label="Checking this listing…" />
      </div>
    </main>
  );
}
