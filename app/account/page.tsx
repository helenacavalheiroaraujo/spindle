import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { currentUser } from "@/lib/db/session";
import { getProfileName } from "@/lib/db/profiles";
import { getSavedAddresses } from "@/lib/db/addresses";
import { getSavedRanking } from "@/lib/db/preferences";
import { getOrdersForBuyer } from "@/lib/db/orders";
import { splitOrders } from "@/lib/rules/orderProgress";
import { accountPriorityLines } from "@/lib/rules/priorities";
import { LogOutButton } from "./LogOutButton";
import { OrderCard } from "./OrderCard";
import { PasswordForm } from "./PasswordForm";
import { AddressesForm } from "./AddressesForm";

// Your account (story 9 · use case 3): name, email and Log out. Private; not the public profile (out of scope).
// Password and saved addresses (bug 9). "My listings" is reached from here (story 8 · finding #13).
// "On its way" and "Delivered": the buyer's orders, with "It arrived, all good" (story 7 · step 3).
// "Buying priorities": the saved ranking, shown only, hidden when none is saved (story 23).
export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Faccount");
  const [name, orders, saved, ranking] = await Promise.all([
    getProfileName(user.id).catch(() => null),
    getOrdersForBuyer(user.id),
    getSavedAddresses(user.id),
    getSavedRanking(user.id),
  ]);
  const { onItsWay, delivered } = splitOrders(orders);
  const priorityLines = accountPriorityLines(ranking);

  return (
    <main className="px-4 pb-16 page-main page-narrow">
      <Header />
      <h1 className="mt-6 font-heading text-4xl leading-tight">Your account</h1>
      <dl className="mt-6 space-y-4 rounded-2xl border border-line bg-white/60 p-5">
        {name && (
          <div>
            <dt className="text-sm text-navy/70">Name</dt>
            <dd className="font-medium">{name}</dd>
          </div>
        )}
        <div>
          <dt className="text-sm text-navy/70">Email</dt>
          <dd className="break-all font-medium">{user.email}</dd>
        </div>
      </dl>
      {priorityLines.length > 0 && (
        <section aria-label="Buying priorities" className="mt-6 rounded-2xl border border-line bg-white/60 p-5">
          <h2 className="font-heading text-3xl leading-tight">Buying priorities</h2>
          <p className="mt-1 text-sm text-navy/70">Your order, used for the recommendation when you buy.</p>
          <ol className="mt-4 space-y-2">
            {priorityLines.map((line) => (
              <li key={line.rank} className="flex items-center gap-3 rounded-full border border-line bg-white px-2 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy font-semibold text-cream">
                  {line.rank}
                </span>
                <span className="font-medium">{line.label}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
      <PasswordForm />
      <AddressesForm saved={saved} />
      {onItsWay.length > 0 && (
        <section aria-label="On its way" className="mt-8">
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
      {orders.length > 0 && <p className="mt-2 text-sm text-navy/70">Simulated payment · Illustrative data</p>}
      <Link
        href="/my-listings"
        className="mt-8 flex min-h-14 items-center justify-between rounded-2xl border border-line bg-white/60 px-5 font-semibold"
      >
        My listings <span aria-hidden>›</span>
      </Link>
      <LogOutButton />
    </main>
  );
}
