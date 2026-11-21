"use client";
// The header's cart count comes from the layout, which does not reload when the buyer moves between pages. When a record
// was sold meanwhile, the count would still show the old number (bug 33). The cart screen knows how many records can
// still be bought; if the header shows another number, it asks for the layout once more. Once only, so a mismatch that
// cannot be fixed never loops.
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartCount } from "./SignedIn";

export function CartCountSync({ available }: { available: number }) {
  const shown = useCartCount();
  const router = useRouter();
  const asked = useRef(false);
  useEffect(() => {
    if (shown !== available && !asked.current) {
      asked.current = true;
      router.refresh();
    }
  }, [shown, available, router]);
  return null;
}
