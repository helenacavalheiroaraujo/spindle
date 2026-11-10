import { Header } from "@/components/Header";
import { LoadingMask } from "@/components/LoadingMask";

// While the results load (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="px-4 pb-16 page-main page-mid">
      <Header />
      <div className="relative min-h-96">
        <LoadingMask label="Searching…" />
      </div>
    </main>
  );
}
