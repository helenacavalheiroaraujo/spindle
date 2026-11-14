import { AlbumSearch } from "../AlbumSearch";
import { Header } from "@/components/Header";
import { currentUserId } from "@/lib/db/session";
import { SignInRequired } from "@/components/SignInRequired";

// "Sell for free" (story 8 · use case 1): a search screen of its own, same box and matching as story 1
// (finding #36). Requires login; after login the seller comes back here.
export default async function SellSearchPage() {
  if (!(await currentUserId())) return <SignInRequired path="/sell" />; // story 29
  return (
    <main className="px-4 pb-16 page-main page-narrow">
      <Header />
      <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">Which record are you selling?</h1>
      <p className="mt-2 text-base">Find the album, then pick your exact version. 0% commission.</p>
      <AlbumSearch />
    </main>
  );
}
