"use client";
// Shared error screen (SPEC · Shared rules): says what failed, in plain language, with "Try again".
export function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-line bg-white/60 p-6 text-center">
      <p className="font-medium">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 min-h-12 rounded-full bg-navy px-6 font-semibold text-cream">
        Try again
      </button>
    </div>
  );
}
