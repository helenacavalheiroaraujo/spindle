"use client";
// My listings body (finding #74, option B). Phone: tapping a listing on sale opens a sheet from the bottom.
// Desktop: the sheet is a panel beside the list. Sold rows cannot be tapped. Remove asks first, then a
// toast "Listing removed" with "Undo" stays 5 seconds (findings #35, #81). Rules: lib/rules/myListings, sellForm.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { remove, saveChanges, undoRemove, type ChangeResult } from "./actions";
import type { MyListing } from "@/lib/db/listings";
import type { ReceivedMessage } from "@/lib/db/messages";
import { priceLabel } from "@/lib/rules/fairPrice";
import { JUST_SOLD_MESSAGE, UNDO_SECONDS, hasChanges } from "@/lib/rules/myListings";
import { formatPrice } from "@/lib/rules/recommendation";
import { canSaveEdit, checkPrice } from "@/lib/rules/sellForm";
import { ConditionPicker } from "@/components/ConditionPicker";
import { ErrorScreen } from "@/components/ErrorScreen";
import { PHOTO_SLOTS, PhotoSlot, preparePhoto, type PhotoKind } from "@/components/PhotoSlot";
import { LoadingMask } from "@/components/LoadingMask";
import { TrafficLight } from "@/components/TrafficLight";

type Tab = "on_sale" | "sold";

export function MyListings({ onSale, sold, messages }: { onSale: MyListing[]; sold: MyListing[]; messages: Record<string, ReceivedMessage> }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("on_sale");
  const [openId, setOpenId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string | null>(null); // listing id while the Undo toast shows
  const [undoFailed, setUndoFailed] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Also found among sold listings: if it was bought while open, the sheet stays to say "This record was just sold".
  const open = [...onSale, ...sold].find((l) => l.id === openId) ?? null;
  const rows = tab === "on_sale" ? onSale : sold;

  // After 5 seconds the toast goes and the removal is final; leaving the page has the same effect.
  useEffect(() => {
    if (!removed) return;
    const timer = setTimeout(() => setRemoved(null), UNDO_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [removed]);

  function undo(listingId: string) {
    setRemoved(null);
    startTransition(async () => {
      const result = await undoRemove(listingId);
      if (result === "ok") (setUndoFailed(null), router.refresh());
      else setUndoFailed(listingId);
    });
  }

  if (undoFailed) {
    return (
      <div className="mt-6">
        <ErrorScreen message="We couldn't put your listing back on sale. Check your connection." onRetry={() => undo(undoFailed)} />
      </div>
    );
  }

  return (
    <div className="relative mt-4 lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-10">
      {pending && <LoadingMask label="Saving…" />}
      <div>
        <div role="tablist" aria-label="My listings" className="flex gap-2">
          {(
            [
              ["on_sale", `On sale (${onSale.length})`],
              ["sold", `Sold (${sold.length})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => (setTab(value), setOpenId(null))}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                tab === value ? "border-navy bg-navy text-cream" : "border-navy/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul aria-label={tab === "on_sale" ? "On sale" : "Sold"} className="mt-4 flex flex-col gap-3">
          {rows.map((l) =>
            tab === "on_sale" ? (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(l.id)}
                  aria-label={`${l.albumTitle}, ${l.versionName}, ${formatPrice(l.price)}`}
                  className={`w-full rounded-2xl border bg-white/60 p-4 text-left ${openId === l.id ? "border-navy ring-1 ring-navy" : "border-line"}`}
                >
                  <Row listing={l} chevron />
                </button>
              </li>
            ) : (
              <li key={l.id} className="rounded-2xl border border-line bg-white/40 p-4">
                <div className="opacity-80">
                  <Row listing={l} />
                </div>
                {messages[l.id] && (
                  <p className="mt-3 whitespace-pre-line rounded-xl border border-line bg-sand p-3 text-sm">
                    <span className="block font-semibold">Message from {messages[l.id].from}</span>“{messages[l.id].body}”
                  </p>
                )}
              </li>
            ),
          )}
        </ul>
        {rows.length === 0 && (
          <p className="mt-4 rounded-2xl border border-line bg-white/50 p-5">
            {tab === "on_sale" ? (
              <>
                Nothing on sale right now.{" "}
                <Link href="/sell" className="font-semibold underline">
                  Sell a record
                </Link>
              </>
            ) : (
              "Nothing sold yet."
            )}
          </p>
        )}
      </div>

      {open && (
        <Sheet
          key={open.id}
          listing={open}
          onClose={() => setOpenId(null)}
          onChanged={() => router.refresh()}
          onRemoved={() => (setOpenId(null), setRemoved(open.id), router.refresh())}
        />
      )}

      {removed && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-6 z-40 mx-auto flex max-w-md items-center justify-between gap-4 rounded-full bg-navy px-6 py-3 text-cream shadow-lg"
        >
          <span className="font-semibold">Listing removed</span>
          <button type="button" onClick={() => undo(removed)} className="min-h-11 font-semibold underline">
            Undo
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ listing: l, chevron = false }: { listing: MyListing; chevron?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      {l.coverPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={l.coverPhoto} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover" />
      ) : (
        <span aria-hidden className="h-14 w-14 shrink-0 rounded-lg border border-line bg-white/60" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{l.albumTitle}</span>
        <span className="block text-sm text-navy/70">
          {l.versionName} · {l.condition.name} ({l.condition.code})
        </span>
        {l.status === "on_sale" && (
          <span className="mt-1 inline-block">
            <TrafficLight light={l.light} />
          </span>
        )}
      </span>
      <span className="shrink-0 font-bold">
        {formatPrice(l.price)}
        {chevron && <span aria-hidden> ›</span>}
      </span>
    </span>
  );
}

// Detail sheet (phone: from the bottom; desktop: panel beside the list). Edit the condition, price (finding #80)
// and photos (bug 10), or remove. The version cannot be changed. The rules come from lib/rules/sellForm.
function Sheet({
  listing: l,
  onClose,
  onChanged,
  onRemoved,
}: {
  listing: MyListing;
  onClose: () => void;
  onChanged: () => void;
  onRemoved: () => void;
}) {
  const [typed, setTyped] = useState(String(l.price));
  const [condition, setCondition] = useState<string>(l.condition.code);
  const [photos, setPhotos] = useState<Partial<Record<PhotoKind, File>>>({});
  const [photoErrors, setPhotoErrors] = useState<Partial<Record<PhotoKind, string>>>({});
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<ChangeResult | null>(null);
  const [retry, setRetry] = useState<(() => void) | null>(null);
  const [pending, startTransition] = useTransition();
  const checked = checkPrice(typed);
  const label = checked.ok ? priceLabel(checked.price, l.typicalRange) : null;
  const hasRange = l.typicalRange.min !== null && l.typicalRange.max !== null;
  const saved: Record<PhotoKind, string | null> = { cover: l.coverPhoto, record: l.recordPhoto, matrix: l.matrixPhoto };
  const valid = canSaveEdit({ condition, price: typed, hasCover: !!photos.cover || !!saved.cover, hasRecord: !!photos.record || !!saved.record });
  const changed = hasChanges({
    conditionBefore: l.condition.code,
    conditionNow: condition,
    priceBefore: l.price,
    priceNow: checked.ok ? checked.price : null,
    newPhotos: Object.keys(photos).length,
  });

  async function pick(kind: PhotoKind, file: File | undefined) {
    if (!file) return;
    const prepared = await preparePhoto(file);
    if ("error" in prepared) return setPhotoErrors((e) => ({ ...e, [kind]: prepared.error }));
    setPhotos((p) => ({ ...p, [kind]: prepared.file }));
    setPhotoErrors((e) => ({ ...e, [kind]: undefined }));
    setResult(null);
  }

  // Escape closes the sheet, unless the "Remove this listing?" question is open on top of it.
  useEffect(() => {
    if (confirming) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming, onClose]);

  function save() {
    const form = new FormData();
    form.set("condition", condition);
    form.set("price", typed);
    for (const { kind } of PHOTO_SLOTS) if (photos[kind]) form.set(kind, photos[kind]!);
    startTransition(async () => {
      const r = await saveChanges(l.id, form);
      setResult(r);
      setRetry(() => (r === "failed" ? save : null));
      if (r === "ok") setPhotos({});
      if (r === "ok" || r === "sold") onChanged();
    });
  }
  function confirmRemove() {
    setConfirming(false);
    startTransition(async () => {
      const r = await remove(l.id);
      setResult(r);
      setRetry(() => (r === "failed" ? confirmRemove : null));
      if (r === "ok") onRemoved();
      else if (r === "sold") onChanged();
    });
  }

  return (
    <>
      <div aria-hidden onClick={onClose} className="fixed inset-0 z-30 bg-navy/40 lg:hidden" />
      <section
        aria-label="Listing details"
        className="fixed inset-x-0 bottom-0 z-30 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-line bg-cream p-5 shadow-2xl lg:sticky lg:top-6 lg:z-0 lg:max-h-none lg:rounded-3xl lg:bg-white/60 lg:shadow-none"
      >
        {pending && <LoadingMask label="Saving…" />}
        <div className="flex items-start gap-3">
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{l.albumTitle}</span>
            <span className="block text-sm text-navy/70">
              {l.versionName} · {l.condition.name} ({l.condition.code})
            </span>
          </span>
          <button type="button" onClick={onClose} className="min-h-11 text-sm font-semibold underline">
            Close
          </button>
        </div>
        <p className="mt-2 text-sm text-navy/70">The version can&apos;t be changed.</p>

        {result === "failed" && retry ? (
          <div className="mt-4">
            <ErrorScreen
              message="We couldn't save the change. Check your connection."
              onRetry={() => (setResult(null), retry())}
            />
          </div>
        ) : result === "sold" ? (
          <p role="alert" className="mt-4 rounded-2xl border border-red-700 bg-white/70 p-4 font-semibold text-red-800">
            {JUST_SOLD_MESSAGE}
          </p>
        ) : (
          <>
            <ConditionPicker name="edit-condition" value={condition} onChange={(c) => (setCondition(c), setResult(null))} columns="grid-cols-2" />

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Photos</legend>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {PHOTO_SLOTS.map((s) => (
                  <PhotoSlot
                    key={s.kind}
                    {...s}
                    file={photos[s.kind]}
                    currentUrl={saved[s.kind]}
                    error={photoErrors[s.kind]}
                    onPick={(f) => pick(s.kind, f)}
                  />
                ))}
              </div>
              {PHOTO_SLOTS.map(
                (s) =>
                  photoErrors[s.kind] && (
                    <p key={s.kind} role="alert" className="mt-2 text-sm font-medium text-red-800">
                      {s.label}: {photoErrors[s.kind]}
                    </p>
                  ),
              )}
            </fieldset>

            <label htmlFor="edit-price" className="mt-6 block text-sm font-semibold">
              Price
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="flex min-h-12 w-32 items-center rounded-2xl border border-line bg-white/70 px-4 focus-within:border-navy">
                <span aria-hidden>€</span>
                <input
                  id="edit-price"
                  inputMode="decimal"
                  autoComplete="off"
                  value={typed}
                  onChange={(e) => (setTyped(e.target.value), setResult(null))}
                  className="w-full bg-transparent pl-1 outline-none"
                />
              </span>
              {hasRange && (
                <span className="text-sm text-navy/70">
                  Typical for this pressing: {formatPrice(l.typicalRange.min!)}–{formatPrice(l.typicalRange.max!)}
                </span>
              )}
              {label && (
                <span className="whitespace-nowrap rounded-full border border-line bg-white/70 px-2.5 py-0.5 text-xs font-semibold">
                  {label}
                </span>
              )}
            </div>
            {!checked.ok && checked.message && (
              <p role="alert" className="mt-2 text-sm font-medium text-red-800">
                {checked.message}
              </p>
            )}
            <p className="mt-2 text-sm">
              {checked.ok ? `No commission: you receive ${formatPrice(checked.price)}` : "No commission: you receive the full price"}
            </p>
            {result === "ok" && (
              <p role="status" className="mt-2 text-sm font-semibold">
                Changes saved
              </p>
            )}
            {result === "invalid" && (
              <p role="alert" className="mt-2 text-sm font-medium text-red-800">
                Check the condition, price and photos, then save again.
              </p>
            )}
            <button
              type="button"
              onClick={save}
              disabled={!valid || !changed || pending}
              className="mt-4 min-h-12 w-full rounded-full bg-navy px-6 font-semibold text-cream disabled:cursor-not-allowed disabled:bg-navy/40"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-3 min-h-12 w-full rounded-full border border-[#9a3b2a] px-6 font-semibold text-[#9a3b2a]"
            >
              Remove listing
            </button>
          </>
        )}
      </section>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="remove-title" className="w-full max-w-sm rounded-3xl bg-cream p-6">
            <h2 id="remove-title" className="font-heading text-3xl">
              Remove this listing?
            </h2>
            <p className="mt-1 text-sm text-navy/70">Buyers will no longer see it.</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirming(false)}
                className="min-h-12 flex-1 rounded-full border border-navy px-4 font-semibold"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="min-h-12 flex-1 rounded-full bg-[#9a3b2a] px-4 font-semibold text-cream"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
