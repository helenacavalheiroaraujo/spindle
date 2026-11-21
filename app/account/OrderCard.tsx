"use client";
// An order on Your account (story 7 · step 3, design p. 8 and p. 10 "On its way"): the four steps, and "It arrived, all good"
// while the order is waiting. One more step before the money is released (DECISIONS 2026-11-08).
// Shared loading mask and error screen (CLAUDE.md).
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelOrderAction,
  confirmReceiptAction,
  rateSellerAction,
  sendMessageAction,
  type CancelState,
  type ConfirmState,
  type MessageState,
  type RateState,
} from "./actions";
import type { OrderView } from "@/lib/db/orders";
import { euros } from "@/lib/rules/checkoutTotal";
import { CANCEL_REFUSED, canCancel, canConfirmReceipt, cancelQuestion, cancelledLine } from "@/lib/rules/orderProgress";
import { OrderProgress } from "@/components/OrderProgress";
import { canRate, canSendReview, starsText } from "@/lib/rules/sellerRating";
import { MAX_MESSAGE_LENGTH, canMessageSeller } from "@/lib/rules/orderMessage";
import { LoadingMask } from "@/components/LoadingMask";
import { ErrorScreen } from "@/components/ErrorScreen";
import { SellerLine } from "@/components/SellerLine";

const initial: ConfirmState = { status: "ready" };
const initialRate: RateState = { status: "ready" };

// Orders the buyer has just confirmed in this tab: once the card moves to "Delivered", the question opens by itself
// (story 18). After a reload it is a "Rate this seller" button instead.
const justConfirmed = new Set<string>();

// Story 39 · use case 3: orders whose cancel was refused in this tab (confirmed elsewhere). The card moves to its real
// group, so it is drawn again; this keeps "This order can no longer be cancelled." on it once.
const cancelRefused = new Set<string>();

export function OrderCard({ order }: { order: OrderView }) {
  if (order.status === "cancelled") return <CancelledCard order={order} />;
  return <LiveOrderCard order={order} />;
}

// Story 39 · "After cancelling": greyed, no steps, no buttons; "You wrote" stays when there is a message (owner's choice 2a).
function CancelledCard({ order }: { order: OrderView }) {
  return (
    <li className="rounded-2xl border border-line bg-[#ece5d6] p-4 text-navy/70" aria-label={`${order.albumTitle}, ${order.versionName}`}>
      <OrderHeading order={order} />
      <p className="mt-3 font-semibold text-navy">{cancelledLine(order.total)}</p>
      <OrderMessage order={order} />
    </li>
  );
}

function OrderHeading({ order }: { order: OrderView }) {
  return (
    <div className="flex items-center gap-3">
      {order.cover ? (
        <img src={order.cover} alt="" className={`h-12 w-12 shrink-0 rounded-lg border border-line object-cover ${order.status === "cancelled" ? "opacity-60 grayscale" : ""}`} />
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
  );
}

function LiveOrderCard({ order }: { order: OrderView }) {
  const [state, action, pending] = useActionState(confirmReceiptAction.bind(null, order.id), initial);
  const [asking, setAsking] = useState(false);
  const [dismissed, setDismissed] = useState<ConfirmState | null>(null);
  const waiting = canConfirmReceipt(order.status);
  const [rateOpen, setRateOpen] = useState(() => justConfirmed.has(order.id) && canRate(order.status, order.reviewed));
  const [refused] = useState(() => cancelRefused.has(order.id));
  useEffect(() => {
    justConfirmed.delete(order.id); // asked once; a reload shows the button
    cancelRefused.delete(order.id); // shown once
  }, [order.id]);

  return (
    <li className="relative rounded-2xl border border-line bg-white/60 p-4" aria-label={`${order.albumTitle}, ${order.versionName}`}>
      {pending && <LoadingMask label="Confirming…" />}
      <OrderHeading order={order} />

      <OrderProgress status={order.status} />
      {refused && <p role="status" className="mt-3 text-sm font-semibold">{CANCEL_REFUSED}</p>}

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
            className="mr-3 mt-3 min-h-12 rounded-full bg-navy px-5 font-semibold text-cream"
          >
            It arrived, all good
          </button>
        ))
      )}

      <OrderMessage order={order} />
      {canCancel(order.status) && !asking && <CancelOrder order={order} />}
    </li>
  );
}

// "Cancel order" (story 39, design part 3, option A): a quiet link under the buttons opens a box with "Keep order" and
// "Cancel order". Esc is "Keep order". Shared loading mask and error screen (CLAUDE.md).
function CancelOrder({ order }: { order: OrderView }) {
  const [state, action, pending] = useActionState(cancelOrderAction.bind(null, order.id), { status: "ready" } as CancelState);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<CancelState | null>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (open) keepRef.current?.focus();
  }, [open]);
  // Refused: the action changed nothing, so the page is refreshed here to show the order's real status.
  useEffect(() => {
    if (state.status !== "refused") return;
    cancelRefused.add(order.id);
    router.refresh();
  }, [state, order.id, router]);

  if (state.status === "failed" && dismissed !== state) {
    return (
      <div className="mt-3">
        <ErrorScreen message="We couldn't cancel your order. Check your connection." onRetry={() => setDismissed(state)} />
      </div>
    );
  }
  if (!open) {
    return (
      <div className="mt-1 text-center">
        <button type="button" onClick={() => setOpen(true)} className="min-h-11 px-2 text-sm font-semibold underline">
          Cancel order
        </button>
      </div>
    );
  }
  return (
    <form
      action={action}
      role="group"
      aria-labelledby={`cancel-${order.id}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !pending) setOpen(false);
      }}
      className="relative mt-3 rounded-[20px] border border-navy bg-white p-4 shadow-[0_8px_24px_rgba(29,36,51,0.18)]"
    >
      {pending && <LoadingMask label="Cancelling…" />}
      <p id={`cancel-${order.id}`} className="font-heading text-2xl leading-tight">Cancel this order?</p>
      <p className="mt-1 text-sm text-navy/70">{cancelQuestion(order.total)}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          ref={keepRef}
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="min-h-12 flex-1 whitespace-nowrap rounded-full border border-navy px-3 font-semibold"
        >
          Keep order
        </button>
        <button type="submit" disabled={pending} className="min-h-12 flex-1 whitespace-nowrap rounded-full bg-navy px-3 font-semibold text-cream">
          Cancel order
        </button>
      </div>
    </form>
  );
}

// "Message the seller" (bug 8, design option A): one message from a small form, shown as "You wrote" afterwards.
// Only while the order is "Paid"; once written it stays visible, also after delivery.
function OrderMessage({ order }: { order: OrderView }) {
  const [state, action, pending] = useActionState(sendMessageAction.bind(null, order.id), { status: "ready" } as MessageState);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<MessageState | null>(null);
  const written = order.message ?? (state.status === "done" ? (state.text ?? null) : null);

  if (written) {
    return (
      <div className="mt-3 rounded-2xl border border-line bg-white/60 p-4">
        <p className="font-semibold">You wrote</p>
        <p className="mt-1 whitespace-pre-line text-sm text-navy/80">“{written}”</p>
      </div>
    );
  }
  if (!canMessageSeller(order.status, false)) return null;
  if (state.status === "failed" && dismissed !== state) {
    return (
      <div className="mt-3">
        <ErrorScreen message="We couldn't send your message. Check your connection." onRetry={() => setDismissed(state)} />
      </div>
    );
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 min-h-12 rounded-full border border-navy px-5 font-semibold">
        Message the seller
      </button>
    );
  }
  return (
    <form action={action} className="relative mt-3 rounded-2xl border border-line bg-sand p-4">
      {pending && <LoadingMask label="Sending…" />}
      <label htmlFor={`message-${order.id}`} className="font-semibold">Your message to the seller</label>
      <textarea
        id={`message-${order.id}`}
        name="message"
        rows={3}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder="Write your message…"
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? `message-${order.id}-error` : undefined}
        className={`mt-2 w-full rounded-2xl border bg-white/70 px-4 py-3 ${state.error ? "border-red-700" : "border-line"}`}
      />
      {state.error && <p id={`message-${order.id}-error`} className="mt-1 text-sm font-medium text-red-800">{state.error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="min-h-12 rounded-full bg-navy px-5 font-semibold text-cream">
          Send message
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={pending} className="min-h-12 rounded-full border border-navy px-5 font-semibold">
          Not now
        </button>
      </div>
    </form>
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
