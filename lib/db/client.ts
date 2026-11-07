// Server-only Supabase client. The secret key has no NEXT_PUBLIC_ prefix, so it never reaches the browser.
import { createClient } from "@supabase/supabase-js";

export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase URL or SUPABASE_SECRET_KEY is missing from the environment.");
  return createClient(url, key, { auth: { persistSession: false } });
}
