// Where "Add to cart" sends a signed-out buyer after logging in (story 20 · use case 1): adds the record, then goes
// back to the page they were on. A page rather than a route handler, so the browser's address follows the redirect.
// Only addresses inside Spindle are followed (returnPath).
import { redirect } from "next/navigation";
import { addToCart } from "@/lib/db/cart";
import { currentUser } from "@/lib/db/session";
import { returnPath, withReturn } from "@/lib/rules/login";

export default async function AddToCartPage({
  params,
  searchParams,
}: {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { listingId } = await params;
  const next = (await searchParams).next;
  const back = returnPath(Array.isArray(next) ? next[0] : next);
  const user = await currentUser().catch(() => null);
  if (!user) redirect(withReturn("/login", `/cart/add/${listingId}?next=${encodeURIComponent(back)}`));
  try {
    await addToCart(user.id, listingId, user.name);
  } catch {
    // The buyer is back on the page and can use "Add to cart" again, which shows the error with "Try again".
  }
  redirect(back);
}
