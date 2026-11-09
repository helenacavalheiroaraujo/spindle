import Link from "next/link";
import { redirect } from "next/navigation";
import { BackLink } from "@/components/BackLink";
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
      <main className="px-4 pb-16 page-main page-narrow">
        <Header />
        <p role="status" className="mt-6 rounded-2xl border border-line bg-white/60 p-6 text-center font-medium">
          {NOT_IN_CATALOGUE}
        </p>
        <Link href="/sell" className="mt-4 inline-flex items-center gap-3 text-sm font-semibold">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-navy/30">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </span>
          Back to search
        </Link>
      </main>
    );
  }
  const profile = await getSellerProfile(user.id, user.name);
  if (!profile) throw new Error("No profile for the signed-in user.");

  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <BackLink href={`/sell/albums/${version.albumId}`}>Back to versions</BackLink>
      <SellForm version={version} needsCity={profile.city === null} />
    </main>
  );
}
