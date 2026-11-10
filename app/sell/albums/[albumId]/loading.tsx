import { Header } from "@/components/Header";
import { LoadingMask } from "@/components/LoadingMask";

// While the page loads (SPEC · Shared rules).
export default function Loading() {
  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <div className="relative min-h-96">
        <LoadingMask />
      </div>
    </main>
  );
}
