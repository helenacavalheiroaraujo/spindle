"use client";
// One photo slot, shared by the sell form and the edit in My listings (bug 10): tap to choose or take a photo
// (on a phone the browser offers the camera); shows the photo once chosen, or the saved one (`currentUrl`).
import { useEffect, useState } from "react";
import { reducePhoto } from "@/app/sell/versions/[versionId]/reducePhoto";
import { PHOTO_TOO_BIG_MESSAGE, photoTooBig } from "@/lib/rules/sellForm";

export type PhotoKind = "cover" | "record" | "matrix";
export const PHOTO_SLOTS: { kind: PhotoKind; label: string; optional?: boolean }[] = [
  { kind: "cover", label: "Front cover" },
  { kind: "record", label: "Record" },
  { kind: "matrix", label: "Matrix", optional: true },
];

// The photo the seller picked, reduced for sending, or the message to show (size rule: lib/rules/sellForm).
export async function preparePhoto(file: File): Promise<{ file: File } | { error: string }> {
  if (photoTooBig(file.size)) return { error: PHOTO_TOO_BIG_MESSAGE };
  try {
    return { file: await reducePhoto(file) };
  } catch {
    return { error: "We couldn't read this photo. Choose a JPEG or PNG." };
  }
}

export function PhotoSlot({
  kind,
  label,
  optional,
  file,
  currentUrl,
  error,
  onPick,
}: {
  kind: PhotoKind;
  label: string;
  optional?: boolean;
  file?: File;
  currentUrl?: string | null;
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
  const shown = preview ?? currentUrl ?? null;

  return (
    <label
      className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border text-center text-sm ${
        error ? "border-red-700" : shown ? "border-navy" : optional ? "border-dashed border-navy/40" : "border-line bg-white/60"
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
      {shown ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-x-0 bottom-0 bg-navy/80 py-1 text-xs font-semibold text-cream">
            {currentUrl && !preview ? "Change" : `${label} ✓`}
          </span>
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
