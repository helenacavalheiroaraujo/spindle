// The sand summary card (story 20 · design part 3, option A): what is added to the total. Used on the cart screen,
// where it ends with "Go to checkout", and nowhere else; the checkout shows the same rows in its own card.
import type { ReactNode } from "react";
import { euros } from "@/lib/rules/checkoutTotal";
import { cartSummaryRows } from "@/lib/rules/cartTotal";
import type { CartTotal } from "@/lib/rules/cartTotal";

export function CartSummary({ amounts, children }: { amounts: CartTotal; children: ReactNode }) {
  return (
    <section aria-label="Summary" className="rounded-3xl border border-line bg-sand p-5 lg:sticky lg:top-6">
      <dl>
        {cartSummaryRows(amounts).map(([label, amount]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-line py-3">
            <dt>{label}</dt>
            <dd>{euros(amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between py-3 text-lg font-bold">
          <dt>Total</dt>
          <dd>{euros(amounts.total)}</dd>
        </div>
      </dl>
      {children}
    </section>
  );
}
