"use client";
// Checkout body (story 7 · What the checkout shows). Shows what the rules return; never checks anything itself.
// Phone: one column in the design's order (p. 16). Desktop: address, payment and protection on the left;
// the record, the price breakdown and Pay in a card on the right (p. 19).
import Link from "next/link";
import { useActionState, useState } from "react";
import { pay, type PayState } from "./actions";
import { euros, type CheckoutTotal } from "@/lib/rules/checkoutTotal";
import { PROTECTION_STEPS } from "@/lib/rules/protectionSteps";
import { canPay, postcodeError, type ShippingAddress } from "@/lib/rules/shippingAddress";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Field } from "@/components/Field";
import { LoadingMask } from "@/components/LoadingMask";

const EMPTY: ShippingAddress = { name: "", street: "", postcode: "", city: "" };

export function CheckoutForm({
  listingId,
  versionId,
  record,
  amounts,
}: {
  listingId: string;
  versionId: string;
  record: React.ReactNode; // version, condition, seller and city
  amounts: CheckoutTotal;
}) {
  const [state, action, pending] = useActionState(pay.bind(null, listingId, versionId), { status: "ready" } as PayState);
  // The address lives here, so it is kept after "Try again" (SPEC · Shared rules).
  const [address, setAddress] = useState(EMPTY);
  const [dismissed, setDismissed] = useState<PayState | null>(null);
  const set = (field: keyof ShippingAddress) => (value: string) => setAddress((a) => ({ ...a, [field]: value }));
  const sold = state.status === "sold";

  if (state.status === "failed" && dismissed !== state) {
    return (
      <div className="mt-6">
        <ErrorScreen message="We couldn't complete the payment. Nothing was charged." onRetry={() => setDismissed(state)} />
      </div>
    );
  }

  return (
    <form action={action} noValidate className="relative mt-4 flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-12">
      {pending && <LoadingMask label="Paying…" />}

      <div className="contents lg:flex lg:flex-col lg:gap-6">
        <fieldset className="order-2 rounded-2xl border border-line bg-white/60 p-4">
          <legend className="sr-only">Shipping address</legend>
          <p aria-hidden className="text-sm text-navy/70">Ship to</p>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Name" autoComplete="name" value={address.name} onChange={set("name")} />
            <Field name="street" label="Street" autoComplete="street-address" value={address.street} onChange={set("street")} />
            <Field
              name="postcode"
              label="Postcode"
              autoComplete="postal-code"
              value={address.postcode}
              onChange={set("postcode")}
              error={postcodeError(address.postcode) ?? undefined}
            />
            <Field name="city" label="City" autoComplete="address-level2" value={address.city} onChange={set("city")} />
          </div>
        </fieldset>

        <section aria-label="Payment method" className="order-3 flex items-center gap-3 rounded-2xl border border-line bg-white/60 p-4">
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brown/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </span>
          <p>
            <span className="block text-sm text-navy/70">Pay with</span>
            <span className="font-semibold">MB WAY</span>
          </p>
        </section>

        <section aria-labelledby="covers" className="order-5">
          <h2 id="covers" className="text-sm font-semibold">What protection covers</h2>
          <p className="mt-1 lg:text-lg">Pressing check, payment held until delivery, and a refund if the record isn&apos;t as listed.</p>
          <ol aria-label="How protection works" className="mt-4 grid grid-cols-4 gap-2 text-center text-sm lg:text-left">
            {PROTECTION_STEPS.map((step, i) => (
              <li key={step} className="flex flex-col items-center gap-2 lg:items-start">
                <span
                  aria-hidden
                  className={`flex h-9 w-9 items-center justify-center rounded-full border font-semibold ${
                    i === 0 ? "border-navy bg-navy text-cream" : "border-navy"
                  }`}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="contents lg:block lg:rounded-3xl lg:border lg:border-line lg:bg-white/60 lg:p-6">
        <div className="order-1 lg:mb-4">{record}</div>

        <dl aria-label="Price" className="order-4 rounded-2xl border border-line bg-white/60 px-4 lg:border-0 lg:bg-transparent lg:px-0">
          {[
            ["Record", amounts.recordPrice],
            ["Insured shipping", amounts.shipping],
            ["Buyer protection", amounts.protectionFee],
          ].map(([label, amount]) => (
            <div key={label} className="flex justify-between border-b border-line py-3">
              <dt>{label}</dt>
              <dd>{euros(amount as number)}</dd>
            </div>
          ))}
          <div className="flex justify-between py-3 text-lg font-bold">
            <dt>Total</dt>
            <dd>{euros(amounts.total)}</dd>
          </div>
        </dl>

        <div className="order-6 lg:mt-4">
          {sold ? (
            <div role="alert" className="rounded-2xl border border-red-700 bg-white/70 p-4">
              <p className="font-semibold text-red-800">Sorry, this record was just sold</p>
              <Link href={`/versions/${versionId}/listings`} className="mt-2 inline-block min-h-12 py-3 font-semibold underline">
                See other listings
              </Link>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!canPay(address) || pending}
              className="min-h-14 w-full rounded-full bg-navy px-6 text-lg font-semibold text-cream disabled:cursor-not-allowed disabled:bg-navy/40"
            >
              Pay {euros(amounts.total)}
            </button>
          )}
          {!sold && !canPay(address) && (
            <p className="mt-2 text-center text-sm font-medium">Fill in your address to pay</p>
          )}
          <p className="mt-2 text-center text-sm text-navy/70">Simulated payment · Illustrative data</p>
        </div>
      </div>
    </form>
  );
}
