import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { AccountBadge } from "@/components/AccountBadge";
import { SignedInProvider } from "@/components/SignedIn";
import { LoginWindowProvider } from "@/components/LoginWindow";
import { currentUserId } from "@/lib/db/session";
import { getProfileName } from "@/lib/db/profiles";
import { cartListingIds } from "@/lib/db/cart";
import { Footer } from "@/components/Footer";

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
      <body className="relative flex min-h-screen flex-col font-body antialiased">
        <SignedInProvider signedIn={signedIn} name={name ?? ""} cartIds={cartIds}>
          {/* Story 27: Buy, Add to cart, Sell and the menu "Log in" open the log-in window when signed out. */}
          <LoginWindowProvider>
            <AccountBadge signedIn={signedIn} name={name ?? ""} />
            {/* Story 14: the footer sits below the content, at the bottom of the window on short pages. */}
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer />
          </LoginWindowProvider>
        </SignedInProvider>
      </body>
    </html>
  );
}
