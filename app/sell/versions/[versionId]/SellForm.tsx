"use client";
// Sell form body (story 8 · use case 2). Shows what lib/rules/sellForm returns; never checks anything itself.
// Phone: one column (design p. 16). Desktop: the form on the left, the "0% commission" card on the right (p. 20).
// Everything typed and every photo lives in this component, so it is kept after "Try again" (SPEC · Shared rules).
import Link from "next/link";
import { startTransition, useActionState, useEffect, useState } from "react";
import { publish, type PublishState } from "./actions";
import { reducePhoto } from "./reducePhoto";
import type { VersionToSell } from "@/lib/db/albums";
import { priceLabel } from "@/lib/rules/fairPrice";
import { formatPrice } from "@/lib/rules/recommendation";
import { CONDITIONS, PHOTO_TOO_BIG_MESSAGE, canList, checkPrice, listHint, photoTooBig } from "@/lib/rules/sellForm";
import { NOT_IN_CATALOGUE } from "@/app/sell/albums/[albumId]/VersionPicker";
import { ErrorScreen } from "@/components/ErrorScreen";
import { LoadingMask } from "@/components/LoadingMask";

type Kind = "cover" | "record" | "matrix";
const SLOTS: { kind: Kind; label: string; optional?: boolean }[] = [
  { kind: "cover", label: "Front cover" },
  { kind: "record", label: "Record" },
  { kind: "matrix", label: "Matrix", optional: true },
];

export function SellForm({ version, needsCity }: { version: VersionToSell; needsCity: boolean }) {
  const [state, action, pending] = useActionState(publish.bind(null, version.id), { status: "ready" } as PublishState);
  const [dismissed, setDismissed] = useState<PublishState | null>(null);

  const [condition, setCondition] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<Partial<Record<Kind, File>>>({});
  const [photoErrors, setPhotoErrors] = useState<Partial<Record<Kind, string>>>({});
  const [city, setCity] = useState("");
  const [shopName, setShopName] = useState("");

  const checked = checkPrice(price);
  const input = { condition, price, hasCover: !!photos.cover, hasRecord: !!photos.record, needsCity, city };
  const label = checked.ok ? priceLabel(checked.price, version.typicalRange) : null;
  const hasRange = version.typicalRange.min !== null && version.typicalRange.max !== null;
  const youReceive = checked.ok ? `No commission: you receive ${formatPrice(checked.price)}` : "No commission: you receive the full price";

  async function pick(kind: Kind, file: File | undefined) {
    if (!file) return;
    if (photoTooBig(file.size)) return setPhotoErrors((e) => ({ ...e, [kind]: PHOTO_TOO_BIG_MESSAGE }));
    try {
      const reduced = await reducePhoto(file);
      setPhotos((p) => ({ ...p, [kind]: reduced }));
      setPhotoErrors((e) => ({ ...e, [kind]: undefined }));
    } catch {
      setPhotoErrors((e) => ({ ...e, [kind]: "We couldn't read this photo. Choose a JPEG or PNG." }));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canList(input)) return;
    const form = new FormData();
    form.set("condition", condition!);
    form.set("price", price);
    form.set("city", city);
    form.set("shopName", shopName);
    for (const { kind } of SLOTS) if (photos[kind]) form.set(kind, photos[kind]!);
    startTransition(() => action(form));
  }

  if ((state.status === "failed" || state.status === "upload_failed") && dismissed !== state) {
    return (
      <div className="mt-6">
        <ErrorScreen
          message={
            state.status === "upload_failed"
              ? "We couldn't upload your photos. Nothing was listed; your details are kept."
              : "We couldn't list your record. Nothing was listed; your details are kept."
          }
          onRetry={() => setDismissed(state)}
        />
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative mt-2 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-12">
      {pending && <LoadingMask label="Listing your record…" />}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-4xl leading-tight lg:text-6xl">Sell a record</h1>
          <span className="rounded-full border border-navy px-3 py-1 text-sm font-semibold lg:hidden">0% commission</span>
        </div>

        {needsCity && (
          <CityRow city={city} shopName={shopName} onSave={(c, s) => (setCity(c), setShopName(s))} />
        )}

        <h2 className="mt-6 text-sm font-semibold">Pressing</h2>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-line bg-white/60 p-4">
          <span aria-hidden className="h-10 w-10 shrink-0 rounded-full border-[10px] border-navy bg-cream" />
          <p className="min-w-0 flex-1">
            <span className="block font-semibold">
              {version.albumTitle}, {version.name}
            </span>
            <span className="block text-sm text-navy/70">Picked from the catalogue</span>
          </p>
          <Link href={`/sell/albums/${version.albumId}`} className="min-h-11 py-3 text-sm font-semibold underline">
            Change
          </Link>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Condition</legend>
          <div className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {CONDITIONS.map((c) => {
              const selected = condition === c.code;
              return (
                <label
                  key={c.code}
                  className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-2xl border p-3 ${
                    selected ? "border-navy bg-navy text-cream" : "border-line bg-white/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={c.code}
                    checked={selected}
                    onChange={() => setCondition(c.code)}
                    className="sr-only"
                  />
                  <span className="font-semibold">{c.name}</span>
                  <span className={`text-sm ${selected ? "text-cream/80" : "text-navy/70"}`}>
                    {c.code}. {c.short}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Photos</legend>
          <div className="mt-2 grid grid-cols-3 gap-3 lg:grid-cols-4">
            {SLOTS.map((s) => (
              <PhotoSlot key={s.kind} {...s} file={photos[s.kind]} error={photoErrors[s.kind]} onPick={(f) => pick(s.kind, f)} />
            ))}
          </div>
          {SLOTS.map(
            (s) =>
              photoErrors[s.kind] && (
                <p key={s.kind} role="alert" className="mt-2 text-sm font-medium text-red-800">
                  {s.label}: {photoErrors[s.kind]}
                </p>
              ),
          )}
        </fieldset>

        <div className="mt-6">
          <label htmlFor="price" className="text-sm font-semibold">
            Price
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex min-h-12 w-32 items-center rounded-2xl border border-line bg-white/70 px-4 focus-within:border-navy">
              <span aria-hidden>€</span>
              <input
                id="price"
                name="price"
                inputMode="decimal"
                autoComplete="off"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={checked.ok || checked.message === null ? undefined : true}
                aria-describedby="price-help"
                className="w-full bg-transparent pl-1 outline-none"
              />
            </span>
            {hasRange && (
              <span id="price-help" className="text-sm text-navy/70">
                Typical for this pressing: {formatPrice(version.typicalRange.min!)}–{formatPrice(version.typicalRange.max!)}
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
          <p className="mt-2 text-sm lg:hidden">{youReceive}</p>
        </div>

        {state.status === "not_in_catalogue" && (
          <p role="alert" className="mt-6 rounded-2xl border border-red-700 bg-white/70 p-4 font-semibold text-red-800">
            {NOT_IN_CATALOGUE}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
          <button
            type="submit"
            disabled={!canList(input) || pending}
            className="min-h-14 w-full rounded-full bg-navy px-8 text-lg font-semibold text-cream disabled:cursor-not-allowed disabled:bg-navy/40 lg:w-auto"
          >
            List for sale
          </button>
          {listHint(input) && <p className="text-center text-sm text-navy/70 lg:text-left">{listHint(input)}</p>}
        </div>
      </div>

      <aside aria-label="Commission" className="mt-8 hidden rounded-3xl border border-line bg-sand p-6 text-navy lg:mt-20 lg:block">
        <p className="font-heading text-7xl leading-none">0%</p>
        <p className="mt-1 text-xl font-semibold">commission on every sale</p>
        <p className="mt-4">{youReceive}</p>
      </aside>
    </form>
  );
}

// "Selling from · Add your city" (finding #73, option C): opens "Your details" in place. Shown only the first time.
function CityRow({ city, shopName, onSave }: { city: string; shopName: string; onSave: (city: string, shop: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draftCity, setDraftCity] = useState(city);
  const [draftShop, setDraftShop] = useState(shopName);
  useEffect(() => {
    if (open) (setDraftCity(city), setDraftShop(shopName));
  }, [open, city, shopName]);

  if (!open)
    return (
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white/60 p-4">
        <span aria-hidden className="text-xl">⌖</span>
        <p className="min-w-0 flex-1">
          <span className="block text-sm text-navy/70">Selling from</span>
          <span className="block font-semibold">{city ? (shopName ? `${city} · ${shopName}` : city) : "Add your city"}</span>
        </p>
        <button type="button" onClick={() => setOpen(true)} className="min-h-11 text-sm font-semibold underline">
          {city ? "Change" : "Add"}
        </button>
      </div>
    );

  return (
    <section aria-label="Your details" className="mt-4 rounded-2xl border border-navy bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Your details</h2>
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 text-sm font-semibold underline">
          Close
        </button>
      </div>
      <div className="mt-2 grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="city" className="block font-medium">City</label>
          <input
            id="city"
            autoComplete="address-level2"
            placeholder="e.g. Porto"
            value={draftCity}
            onChange={(e) => setDraftCity(e.target.value)}
            className="mt-1 min-h-12 w-full rounded-2xl border border-line bg-white/70 px-4"
          />
        </div>
        <div>
          <label htmlFor="shopName" className="block font-medium">
            Shop name <span className="font-normal text-navy/70">(optional)</span>
          </label>
          <input
            id="shopName"
            autoComplete="organization"
            placeholder="e.g. Discos do Bairro"
            value={draftShop}
            onChange={(e) => setDraftShop(e.target.value)}
            aria-describedby="shopName-hint"
            className="mt-1 min-h-12 w-full rounded-2xl border border-line bg-white/70 px-4"
          />
          <p id="shopName-hint" className="mt-1 text-sm text-navy/70">
            Only if you sell as a shop. Buyers will see a “Shop” tag.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => (onSave(draftCity.trim(), draftShop.trim()), setOpen(false))}
        className="mt-4 min-h-12 rounded-full bg-navy px-6 font-semibold text-cream"
      >
        Save
      </button>
    </section>
  );
}

// One photo slot: tap to choose or take a photo (on a phone the browser offers the camera); shows the photo once chosen.
function PhotoSlot({
  kind,
  label,
  optional,
  file,
  error,
  onPick,
}: {
  kind: Kind;
  label: string;
  optional?: boolean;
  file?: File;
  error?: string;
  onPick: (file: File | undefined) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <label
      className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border text-center text-sm ${
        error ? "border-red-700" : file ? "border-navy" : optional ? "border-dashed border-navy/40" : "border-line bg-white/60"
      }`}
    >
      <input
        type="file"
        name={kind}
        accept="image/*"
        aria-label={`${label} photo${optional ? " (optional)" : ""}`}
        onChange={(e) => onPick(e.target.files?.[0])}
        className="sr-only"
      />
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-x-0 bottom-0 bg-navy/80 py-1 text-xs font-semibold text-cream">{label} ✓</span>
        </>
      ) : (
        <>
          <span aria-hidden className="text-2xl leading-none">+</span>
          <span className="font-semibold">{label}</span>
          {optional && <span className="text-xs text-navy/70">optional</span>}
        </>
      )}
    </label>
  );
}
