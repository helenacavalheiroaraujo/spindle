import { notFound, redirect } from "next/navigation";
import { getOrderForBuyer } from "@/lib/db/orders";
import { currentUserId } from "@/lib/db/session";
import { euros } from "@/lib/rules/checkoutTotal";
import { withReturn } from "@/lib/rules/login";
import { PROTECTION_STEPS } from "@/lib/rules/protectionSteps";
import { Header } from "@/components/Header";
import { SellerLine } from "@/components/SellerLine";

// Confirmation after Pay (story 7 · What the confirmation shows). Only the buyer can open it.
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await currentUserId();
  if (!userId) redirect(withReturn("/login", `/orders/${id}`));
  const order = await getOrderForBuyer(id, userId);
  if (!order) notFound();

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr] lg:items-start">
        <section aria-label="Order" className="rounded-3xl border border-line bg-sand p-6 text-navy lg:p-10">
          <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-lg text-cream">✓</span>
          <h1 className="mt-4 font-heading text-5xl leading-none lg:text-7xl">Order placed</h1>
          <p className="mt-2 text-2xl lg:text-3xl">{euros(order.total)} paid</p>
          <p className="mt-4 inline-block rounded-full bg-navy px-3 py-1 text-sm font-semibold text-cream">
            Paid · waiting for the seller
          </p>
          <div className="mt-6 hidden items-center gap-3 lg:flex">{record(order, true)}</div>
        </section>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 lg:hidden">{record(order, true)}</div>
          <ol aria-label="How protection works" className="rounded-2xl border border-line bg-white/60 p-4">
            {PROTECTION_STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-3 py-2">
                <span
                  aria-hidden
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                    i === 0 ? "border-navy bg-navy text-cream" : "border-navy"
                  }`}
                >
                  {i === 0 ? "✓" : i + 1}
                </span>
                <span>
                  {step}
                  {i === 0 && <span className="sr-only"> (done)</span>}
                  {i === 1 && <span className="text-sm text-navy/70"> · next</span>}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-center text-sm text-navy/70">Simulated payment · Illustrative data</p>
        </div>
      </div>
    </main>
  );
}

function record(order: NonNullable<Awaited<ReturnType<typeof getOrderForBuyer>>>, light = false) {
  return (
    <>
      {order.cover ? (
        <img src={order.cover} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
      ) : (
        <span aria-hidden className={`h-12 w-12 shrink-0 rounded-lg ${light ? "bg-line" : "bg-cream/20"}`} />
      )}
      <p className="text-sm">
        <span className="block font-semibold">
          {order.albumTitle}, {order.versionName}
        </span>
        <span className={light ? "text-navy/70" : "text-cream/80"}>
          {order.condition.name} ({order.condition.code}). <SellerLine seller={order.seller} city={order.city} />
        </span>
      </p>
    </>
  );
}
