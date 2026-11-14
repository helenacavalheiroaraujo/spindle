// The two next steps after Pay (story 30, option A): "See my orders" and "Back to the home page", same size and weight.
// Stacked full width on the phone; side by side from the tablet up.
import Link from "next/link";
import { HOME_PATH, MY_ORDERS_PATH } from "@/lib/rules/orderPlaced";

const button = "inline-flex min-h-12 items-center justify-center rounded-full border border-navy px-6 font-semibold";

export function OrderPlacedActions({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Next steps" className={`grid gap-2.5 sm:flex sm:flex-wrap sm:gap-3 ${className}`}>
      <Link href={MY_ORDERS_PATH} className={`${button} bg-navy text-cream`}>
        See my orders
      </Link>
      <Link href={HOME_PATH} className={button}>
        Back to the home page
      </Link>
    </nav>
  );
}
