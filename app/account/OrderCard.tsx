"use client";
// An order on Your account (story 7 · step 3, design p. 8 and p. 10 "On its way"): the four steps, and "It arrived, all good"
// while the order is waiting. One more step before the money is released (DECISIONS 2026-11-08).
// Shared loading mask and error screen (CLAUDE.md).
import { useActionState, useEffect, useState } from "react";
import { confirmReceiptAction, rateSellerAction, type ConfirmState, type RateState } from "./actions";
import type { OrderView } from "@/lib/db/orders";
import { euros } from "@/lib/rules/checkoutTotal";
import { canConfirmReceipt, PROGRESS_LABELS, stepsDone } from "@/lib/rules/orderProgress";
import { canRate, canSendReview, starsText } from "@/lib/rules/sellerRating";
import { LoadingMask } from "@/components/LoadingMask";
import { ErrorScreen } from "@/components/ErrorScreen";
import { SellerLine } from "@/components/SellerLine";

const initial: ConfirmState = { status: "ready" };
const initialRate: RateState = { status: "ready" };

// Orders the buyer has just confirmed in this tab: once the card moves to "Delivered", the question opens by itself
// (story 18). After a reload it is a "Rate this seller" button instead.
const justConfirmed = new Set<string>();

export function OrderCard({ order }: { order: OrderView }) {
  const [state, action, pending] = useActionState(confirmReceiptAction.bind(null, order.id), initial);
  const [asking, setAsking] = useState(false);
  const [dismissed, setDismissed] = useState<ConfirmState | null>(null);
  const done = stepsDone(order.status);
  const waiting = canConfirmReceipt(order.status);
  const [rateOpen, setRateOpen] = useState(() => justConfirmed.has(order.id) && canRate(order.status, order.reviewed));
  useEffect(() => {
    justConfirmed.delete(order.id); // asked once; a reload shows the button
  }, [order.id]);

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
      {!waiting && order.reviewed && <p className="mt-2 text-sm font-semibold">Thanks, your review is in.</p>}
      {!waiting && canRate(order.status, order.reviewed) &&
        (rateOpen ? (
          <RateSeller orderId={order.id} onNotNow={() => setRateOpen(false)} />
        ) : (
          <button type="button" onClick={() => setRateOpen(true)} className="mt-3 min-h-12 w-full rounded-full border border-navy px-5 font-semibold">
            Rate this seller
          </button>
        ))}

      {waiting && state.status === "failed" && dismissed !== state ? (
        <div className="mt-3">
          <ErrorScreen message="We couldn't confirm your order. Check your connection." onRetry={() => setDismissed(state)} />
        </div>
      ) : (
        waiting &&
        (asking ? (
          <form action={action} onSubmit={() => justConfirmed.add(order.id)} role="group" aria-label="Confirm receipt" className="mt-3 rounded-2xl border border-line bg-sand p-4">
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

// "How was the seller?" (story 18, design option A): 1 to 5 stars as numbered buttons, "Send review" and "Not now".
function RateSeller({ orderId, onNotNow }: { orderId: string; onNotNow: () => void }) {
  const [state, action, pending] = useActionState(rateSellerAction.bind(null, orderId), initialRate);
  const [chosen, setChosen] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState<RateState | null>(null);
  const failed = state.status === "failed" && dismissed !== state;
  return (
    <form action={action} className="relative mt-3 rounded-2xl border border-line bg-sand p-4">
      {pending && <LoadingMask label="Sending…" />}
      <fieldset>
        <legend className="font-semibold">How was the seller?</legend>
        <div className="mt-2 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="relative">
              <input type="radio" name="rating" value={n} checked={chosen === n} onChange={() => setChosen(n)} className="peer sr-only" />
              <span
                aria-hidden
                className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-navy text-lg font-semibold peer-focus-visible:ring-2 peer-focus-visible:ring-navy peer-focus-visible:ring-offset-2 ${
                  chosen !== null && n <= chosen ? "bg-navy text-cream" : "bg-white"
                }`}
              >
                {n}
              </span>
              <span className="sr-only">{n === 1 ? "1 star" : `${n} stars`}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-sm text-navy/70">{starsText(chosen)}</p>
      </fieldset>
      {failed && (
        <div className="mt-3">
          <ErrorScreen message="We couldn't send your review. Check your connection." onRetry={() => setDismissed(state)} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={!canSendReview(chosen) || pending}
          className="min-h-12 rounded-full bg-navy px-5 font-semibold text-cream disabled:bg-navy/40"
        >
          Send review
        </button>
        <button type="button" onClick={onNotNow} disabled={pending} className="min-h-12 rounded-full border border-navy px-5 font-semibold">
          Not now
        </button>
      </div>
    </form>
  );
}
