import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getVersionToSell } from "@/lib/db/albums";
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
      <main className="mx-auto max-w-2xl px-4 pb-16">
        <Header />
        <p role="status" className="mt-6 rounded-2xl border border-line bg-white/60 p-6 text-center font-medium">
          {NOT_IN_CATALOGUE}
        </p>
        <Link href="/sell" className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold">
          <span aria-hidden>←</span> Back to search
        </Link>
      </main>
    );
  }
  const profile = await getSellerProfile(user.id, user.name);
  if (!profile) throw new Error("No profile for the signed-in user.");

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16">
      <Header />
      <SellForm version={version} needsCity={profile.city === null} />
    </main>
  );
}
