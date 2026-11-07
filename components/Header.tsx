import Link from "next/link";

// Shared top bar with the Spindle logo (back to the search).
export function Header() {
  return (
    <header className="flex items-center justify-center py-5">
      <Link href="/" className="flex items-center gap-2 font-heading text-xl tracking-wide">
        <span aria-hidden className="h-5 w-5 rounded-full border-[5px] border-navy" />
        SPINDLE
      </Link>
    </header>
  );
}
