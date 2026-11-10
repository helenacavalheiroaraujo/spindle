"use client";
// The seller's photos on the listing check screen (bug 13, design option A): tap a photo to see it full screen on a
// dark background; "Close" (or Escape), arrows and swipe to move between photos, double-tap to zoom.
import { useEffect, useRef, useState } from "react";
import { stepPhoto, viewerLabel, viewerPhotos, type PhotoKind, type PhotoSet } from "@/lib/rules/photoViewer";

const KINDS: PhotoKind[] = ["cover", "record", "matrix"];
const SWIPE_PX = 50; // a drag shorter than this is a tap, not a swipe
const DOUBLE_TAP_MS = 350;

export function PhotoGallery({ photos }: { photos: PhotoSet }) {
  const viewable = viewerPhotos(photos);
  const [index, setIndex] = useState<number | null>(null); // position among the photos that exist; null = closed
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const startX = useRef<number | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    if (index !== null && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [index]);

  const close = () => {
    dialog.current?.close();
    setIndex(null);
    setZoomed(false);
  };
  const go = (delta: -1 | 1) => {
    setIndex((i) => (i === null ? i : stepPhoto(i, delta, viewable.length)));
    setZoomed(false);
  };

  const current = index === null ? null : viewable[index];

  return (
    <>
      <ul className="mt-2 grid grid-cols-3 gap-3">
        {KINDS.map((kind) => {
          const src = photos[kind];
          const position = viewable.findIndex((p) => p.kind === kind);
          return (
            <li key={kind} className="text-center text-xs">
              {src ? (
                <button type="button" onClick={() => setIndex(position)} aria-label={`Enlarge ${kind} photo`} className="block w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${kind} photo`} className="aspect-square w-full rounded-xl border border-line object-cover" />
                </button>
              ) : (
                <span className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-navy/30 p-2 text-navy/70">
                  No {kind} photo
                </span>
              )}
              <span className="mt-1 block capitalize">{kind}</span>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        onClose={() => {
          setIndex(null);
          setZoomed(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-[#10141f] p-0 text-cream"
      >
        {current && (
          <div className="relative flex h-full flex-col items-center justify-center gap-3 px-4 py-20">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-cream text-xl hover:bg-cream/15"
            >
              ✕
            </button>
            <p className="absolute left-4 top-6 text-sm font-semibold">{viewerLabel(current.kind, index as number, viewable.length)}</p>

            <div
              className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden"
              style={{ touchAction: zoomed ? "none" : "pan-y" }}
              onPointerDown={(e) => {
                startX.current = e.clientX;
              }}
              onPointerUp={(e) => {
                const from = startX.current;
                startX.current = null;
                if (from === null) return;
                const dx = e.clientX - from;
                if (!zoomed && Math.abs(dx) >= SWIPE_PX) return go(dx < 0 ? 1 : -1);
                if (Math.abs(dx) >= SWIPE_PX) return;
                const now = Date.now();
                if (now - lastTap.current < DOUBLE_TAP_MS) {
                  setZoomed((z) => !z);
                  lastTap.current = 0;
                } else lastTap.current = now;
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.src}
                alt={`${current.kind} photo, enlarged`}
                draggable={false}
                className={`max-h-full max-w-full select-none object-contain transition-transform ${zoomed ? "scale-[2.5] cursor-zoom-out" : "cursor-zoom-in"}`}
              />
            </div>

            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={index === 0}
                aria-label="Previous photo"
                className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-cream text-xl hover:bg-cream/15 disabled:opacity-30"
              >
                ‹
              </button>
              <p aria-hidden className="text-lg tracking-[0.4em]">
                {viewable.map((_, i) => (i === index ? "●" : "○")).join("")}
              </p>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={index === viewable.length - 1}
                aria-label="Next photo"
                className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-cream text-xl hover:bg-cream/15 disabled:opacity-30"
              >
                ›
              </button>
            </div>
            <p className="text-xs opacity-75">Swipe for the next photo · double-tap to zoom</p>
          </div>
        )}
      </dialog>
    </>
  );
}
