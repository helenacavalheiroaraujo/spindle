import { Header } from "@/components/Header";
import { LoadingMask } from "@/components/LoadingMask";

// While the listings load (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <div className="relative min-h-96">
        <LoadingMask label="Checking listings…" />
      </div>
    </main>
  );
}
