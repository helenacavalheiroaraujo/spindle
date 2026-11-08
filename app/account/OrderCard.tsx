"use client";
// An order on Your account (story 7 · step 3, design p. 8 and p. 10 "On its way"): the four steps, and "It arrived, all good"
// while the order is waiting. One more step before the money is released (DECISIONS 2026-11-08).
// Shared loading mask and error screen (CLAUDE.md).
import { useActionState, useState } from "react";
import { confirmReceiptAction, type ConfirmState } from "./actions";
import type { OrderView } from "@/lib/db/orders";
import { euros } from "@/lib/rules/checkoutTotal";
import { canConfirmReceipt, PROGRESS_LABELS, stepsDone } from "@/lib/rules/orderProgress";
import { LoadingMask } from "@/components/LoadingMask";
import { ErrorScreen } from "@/components/ErrorScreen";
import { SellerLine } from "@/components/SellerLine";

const initial: ConfirmState = { status: "ready" };

export function OrderCard({ order }: { order: OrderView }) {
  const [state, action, pending] = useActionState(confirmReceiptAction.bind(null, order.id), initial);
  const [asking, setAsking] = useState(false);
  const [dismissed, setDismissed] = useState<ConfirmState | null>(null);
  const done = stepsDone(order.status);
  const waiting = canConfirmReceipt(order.status);

  return (
    <li className="relative rounded-2xl border border-line bg-white/60 p-4" aria-label={`${order.albumTitle}, ${order.versionName}`}>
      {pending && <LoadingMask label="Confirming…" />}
      <div className="flex items-center gap-3">
        {order.cover ? (
          <img src={order.cover} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover" />
        ) : (
          <span aria-hidden className="h-12 w-12 shrink-0 rounded-lg border border-line bg-white/60" />
        )}
        <p className="text-sm">
          <span className="block font-semibold">
            {order.albumTitle}, {order.versionName}
          </span>
          <span className="text-navy/70">
            <SellerLine seller={order.seller} city={order.city} /> · {euros(order.total)}
          </span>
        </p>
      </div>

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

      {waiting ? (
        <p className="mt-3 text-sm text-navy/70">Your money is held by Spindle until you confirm the record is as listed.</p>
      ) : (
        <p className="mt-3 text-sm text-navy/70">Delivered. The seller has been paid.</p>
      )}

      {waiting && state.status === "failed" && dismissed !== state ? (
        <div className="mt-3">
          <ErrorScreen message="We couldn't confirm your order. Check your connection." onRetry={() => setDismissed(state)} />
        </div>
      ) : (
        waiting &&
        (asking ? (
          <form action={action} role="group" aria-label="Confirm receipt" className="mt-3 rounded-2xl border border-line bg-sand p-4">
            <p className="font-semibold">Are you sure? The money is released to the seller.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="submit" disabled={pending} className="min-h-12 rounded-full bg-navy px-5 font-semibold text-cream">
                Yes, release the money
              </button>
              <button
                type="button"
                onClick={() => setAsking(false)}
                disabled={pending}
                className="min-h-12 rounded-full border border-navy px-5 font-semibold"
              >
                Not yet
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAsking(true)}
            className="mt-3 min-h-12 rounded-full bg-navy px-5 font-semibold text-cream"
          >
            It arrived, all good
          </button>
        ))
      )}
    </li>
  );
}
