import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/db/session";
import { getOrdersForBuyer } from "@/lib/db/orders";
import { splitOrders } from "@/lib/rules/orderProgress";
import { withReturn } from "@/lib/rules/login";
import { OrderCard } from "./OrderCard";

// Your account, Orders tab (story 31): /account and /account/orders. The profile header and the tabs are in layout.tsx.
// "On its way" and "Delivered": the buyer's orders, with "It arrived, all good" (story 7 · step 3) and the seller
// rating (story 18). No orders: "No orders yet" and a link to search (story 31 · Edge cases).
export default async function OrdersTab() {
  const user = await currentUser();
  if (!user) redirect(withReturn("/login", "/account"));
  const orders = await getOrdersForBuyer(user.id);
  const { onItsWay, delivered } = splitOrders(orders);

  if (orders.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-white/60 p-5">
        <p>No orders yet</p>
        <Link href="/" className="mt-2 inline-flex min-h-11 items-center font-semibold underline">
          Search for a record
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:max-w-[820px]">
      {onItsWay.length > 0 && (
        <section aria-label="On its way" className="mt-6">
          <h2 className="font-heading text-3xl leading-tight">On its way</h2>
          <ul className="mt-3 space-y-3">
            {onItsWay.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </ul>
        </section>
      )}
      {delivered.length > 0 && (
        <section aria-label="Delivered" className="mt-8">
          <h2 className="font-heading text-3xl leading-tight">Delivered</h2>
          <ul className="mt-3 space-y-3">
            {delivered.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </ul>
        </section>
      )}
      <p className="mt-2 text-sm text-navy/70">Simulated payment · Illustrative data</p>
    </div>
  );
}
