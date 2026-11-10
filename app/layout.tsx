import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { AccountBadge } from "@/components/AccountBadge";
import { SignedInProvider } from "@/components/SignedIn";
import { currentUserId } from "@/lib/db/session";
import { getProfileName } from "@/lib/db/profiles";
import { cartListingIds } from "@/lib/db/cart";

// Headings: bold condensed sans-serif; body: plain readable sans-serif (CLAUDE.md, visual direction).
const heading = Barlow_Condensed({ subsets: ["latin"], weight: ["600"], variable: "--font-heading" }); // semibold headings (DECISIONS 2026-11-10, option 2)
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Spindle",
  description: "Pick the right pressing and buy a verified copy safely.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // For the menu (stories 15, 19) and the phone badge: signed in or not, and the name (its initials).
  const userId = await currentUserId().catch(() => null);
  const name = userId ? await getProfileName(userId).catch(() => "") : "";
  const signedIn = Boolean(userId);
  const cartIds = userId ? await cartListingIds(userId).catch(() => []) : []; // story 20: the count in the header
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="relative min-h-screen font-body antialiased">
        <SignedInProvider signedIn={signedIn} name={name ?? ""} cartIds={cartIds}>
          <AccountBadge signedIn={signedIn} name={name ?? ""} />
          {children}
        </SignedInProvider>
      </body>
    </html>
  );
}
