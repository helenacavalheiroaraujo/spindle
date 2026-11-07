// Shared loading mask (SPEC · Shared rules): covers the area that is loading.
export function LoadingMask({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-cream/80 pt-10">
      <span className="flex items-center gap-2 text-sm font-medium">
        <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        {label}
      </span>
    </div>
  );
}
