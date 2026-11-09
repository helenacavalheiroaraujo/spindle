import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { AccountBadge } from "@/components/AccountBadge";
import { SignedInProvider } from "@/components/SignedIn";
import { currentUserId } from "@/lib/db/session";

// Headings: bold condensed sans-serif; body: plain readable sans-serif (CLAUDE.md, visual direction).
const heading = Barlow_Condensed({ subsets: ["latin"], weight: ["700"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Spindle",
  description: "Pick the right pressing and buy a verified copy safely.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await currentUserId().then(Boolean).catch(() => false); // for the menu (story 15)
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="relative min-h-screen font-body antialiased">
        <SignedInProvider signedIn={signedIn}>
          <AccountBadge />
          {children}
        </SignedInProvider>
      </body>
    </html>
  );
}
