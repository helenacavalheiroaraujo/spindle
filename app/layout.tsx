import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

// Headings: bold condensed sans-serif; body: plain readable sans-serif (CLAUDE.md, visual direction).
const heading = Barlow_Condensed({ subsets: ["latin"], weight: ["700"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Spindle",
  description: "Pick the right pressing and buy a verified copy safely.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen font-body antialiased">{children}</body>
    </html>
  );
}
