import Link from "next/link";

// The round back button with its label, as on the genre screen and the version picker (UX review finding #28).
export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3 text-sm font-semibold">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-navy/30">
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </span>
      {children}
    </Link>
  );
}
