"use client";
// "Addresses" block on Your account (bug 9, design option A): delivery address, and a billing address only when it is
// different ("Billing is the same as delivery" is ticked by default). Shows what the rules return; never checks anything itself.
import { useActionState, useState } from "react";
import { saveAddressesAction, type AddressesState } from "./actions";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Field } from "@/components/Field";
import { LoadingMask } from "@/components/LoadingMask";
import { maskPostcode, postcodeError, type ShippingAddress } from "@/lib/rules/shippingAddress";
import type { SavedAddresses } from "@/lib/db/addresses";

const EMPTY: ShippingAddress = { name: "", street: "", postcode: "", city: "" };
const initial: AddressesState = { status: "ready", errors: {} };

function AddressFields({ prefix, address, onChange }: { prefix: string; address: ShippingAddress; onChange: (a: ShippingAddress) => void }) {
  const set = (field: keyof ShippingAddress) => (value: string) => onChange({ ...address, [field]: value });
  return (
    <div className="mt-3 grid gap-4 sm:grid-cols-2">
      <Field name={`${prefix}name`} label="Name" autoComplete="name" value={address.name} onChange={set("name")} />
      <Field name={`${prefix}street`} label="Street" autoComplete="street-address" value={address.street} onChange={set("street")} />
      <Field
        name={`${prefix}postcode`}
        label="Postcode"
        autoComplete="postal-code"
        value={address.postcode}
        onChange={(v) => set("postcode")(maskPostcode(v))}
        error={postcodeError(address.postcode) ?? undefined}
      />
      <Field name={`${prefix}city`} label="City" autoComplete="address-level2" value={address.city} onChange={set("city")} />
    </div>
  );
}

export function AddressesForm({ saved }: { saved: SavedAddresses }) {
  const [state, action, pending] = useActionState(saveAddressesAction, initial);
  const [dismissed, setDismissed] = useState<AddressesState | null>(null);
  // The fields live here, so they are kept after "Try again".
  const [delivery, setDelivery] = useState(saved.delivery ?? EMPTY);
  const [billingSame, setBillingSame] = useState(saved.billing === null);
  const [billing, setBilling] = useState(saved.billing ?? EMPTY);

  if (state.status === "failed" && dismissed !== state) {
    return (
      <section aria-label="Addresses" className="mt-6">
        <ErrorScreen message="We couldn't save your addresses." onRetry={() => setDismissed(state)} />
      </section>
    );
  }

  return (
    <form action={action} noValidate aria-label="Addresses" className="relative mt-6 rounded-2xl border border-line bg-white/60 p-5">
      {pending && <LoadingMask label="Saving…" />}
      <h2 className="font-heading text-2xl leading-tight">Delivery address</h2>
      <AddressFields prefix="delivery-" address={delivery} onChange={setDelivery} />
      {state.errors.delivery && <p role="alert" className="mt-2 text-sm font-medium text-red-800">{state.errors.delivery}</p>}

      <label className="mt-4 flex min-h-12 items-center gap-3 font-medium">
        <input
          type="checkbox"
          name="billingSame"
          checked={billingSame}
          onChange={(e) => setBillingSame(e.target.checked)}
          className="h-5 w-5 accent-navy"
        />
        Billing is the same as delivery
      </label>

      {!billingSame && (
        <>
          <h2 className="mt-2 font-heading text-2xl leading-tight">Billing address</h2>
          <AddressFields prefix="billing-" address={billing} onChange={setBilling} />
          {state.errors.billing && <p role="alert" className="mt-2 text-sm font-medium text-red-800">{state.errors.billing}</p>}
        </>
      )}

      {state.status === "done" && <p role="status" className="mt-4 font-medium">Addresses saved.</p>}
      <button type="submit" disabled={pending} className="mt-4 min-h-12 w-full rounded-full bg-navy px-6 font-semibold text-cream">
        Save addresses
      </button>
    </form>
  );
}
