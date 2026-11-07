// Runs before every page: keeps the Supabase session fresh in cookies (story 9 · session expired).
import type { NextRequest } from "next/server";
import { refreshSession } from "@/lib/db/session";

export function proxy(request: NextRequest) {
  return refreshSession(request);
}

export const config = {
  // Skip Next.js files and images: they never need the session.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
