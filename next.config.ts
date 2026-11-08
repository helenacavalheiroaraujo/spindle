import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sell form (story 8): up to 3 photos, reduced in the browser first, sent in one request.
  // Stays under Vercel's 4.5 MB request limit (DECISIONS · story 8).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
