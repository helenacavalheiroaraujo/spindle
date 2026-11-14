// The four-step progress bar of an order (Paid, Shipped, You confirm, Seller paid), as on the Orders tab.
// Used by the Orders tab (app/account/OrderCard.tsx) and the cart's "Order placed" page (story 30).
import { PROGRESS_LABELS, stepsDone, type OrderStatus } from "@/lib/rules/orderProgress";

export function OrderProgress({ status }: { status: OrderStatus }) {
  const done = stepsDone(status);
  return (
    <ol aria-label="Order progress" className="mt-4 grid grid-cols-4 gap-1.5">
      {PROGRESS_LABELS.map((label, i) => (
        <li key={label}>
          <span aria-hidden className={`block h-1 rounded-full ${i < done ? "bg-navy" : "bg-line"}`} />
          <span className={`mt-1 block text-xs ${i < done ? "font-semibold" : "text-navy/70"}`}>
            {label}
            {i < done && <span className="sr-only"> (done)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
