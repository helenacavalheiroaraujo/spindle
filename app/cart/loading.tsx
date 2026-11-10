import { Header } from "@/components/Header";
import { LoadingMask } from "@/components/LoadingMask";

// While the cart loads (SPEC · Shared rules). The header stays; only the content shows the loading state (bug 1).
export default function Loading() {
  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <div className="relative min-h-96">
        <LoadingMask label="Loading your cart…" />
      </div>
    </main>
  );
}
