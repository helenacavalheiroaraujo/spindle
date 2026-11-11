import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getVersionToSell } from "@/lib/db/albums";
import { getSellingPlace } from "@/lib/db/listings";
import { getSellerProfile } from "@/lib/db/profiles";
import { currentUser } from "@/lib/db/session";
import { withReturn } from "@/lib/rules/login";
import { NOT_IN_CATALOGUE } from "@/app/sell/albums/[albumId]/VersionPicker";
import { SellForm } from "./SellForm";

// Sell form, "Sell a record" (story 8 · use case 2; design p. 16 phone, p. 20 desktop; first time: finding #73, option C).
export default async function SellFormPage({ params }: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await params;
  const user = await currentUser();
  if (!user) redirect(withReturn("/login", `/sell/versions/${versionId}`));

  const version = await getVersionToSell(versionId);
  if (!version) {
    // Edge case: a version not in the catalogue → message, no listing can be created.
    return (
      <main className="px-4 pb-16 page-main page-narrow">
        <Header />
        <p role="status" className="mt-6 rounded-2xl border border-line bg-white/60 p-6 text-center font-medium">
          {NOT_IN_CATALOGUE}
        </p>
      </main>
    );
  }
  const profile = await getSellerProfile(user.id, user.name);
  if (!profile) throw new Error("No profile for the signed-in user.");

  // Bug 11: the place is always on the form, pre-filled with where the last listing was sold from.
  const place = await getSellingPlace(profile.id, { city: profile.city, shopName: profile.shopName });

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <SellForm version={version} place={place} />
    </main>
  );
}
