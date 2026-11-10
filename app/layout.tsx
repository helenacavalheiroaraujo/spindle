import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { AccountBadge } from "@/components/AccountBadge";
import { SignedInProvider } from "@/components/SignedIn";
import { currentUserId } from "@/lib/db/session";
import { getProfileName } from "@/lib/db/profiles";

// Headings: bold condensed sans-serif; body: plain readable sans-serif (CLAUDE.md, visual direction).
const heading = Barlow_Condensed({ subsets: ["latin"], weight: ["700"], variable: "--font-heading" });
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
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="relative min-h-screen font-body antialiased">
        <SignedInProvider signedIn={signedIn} name={name ?? ""}>
          <AccountBadge signedIn={signedIn} name={name ?? ""} />
          {children}
        </SignedInProvider>
      </body>
    </html>
  );
}
