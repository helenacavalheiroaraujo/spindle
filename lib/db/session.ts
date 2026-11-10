// The signed-in user's session (story 9), kept in cookies by @supabase/ssr.
// Uses the publishable key: Supabase Auth checks the password, the app never sees or stores it.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase URL or publishable key is missing from the environment.");
  return { url, key };
}

// For server actions and server components. Server components cannot write cookies; the proxy refreshes them.
export async function authClient() {
  const store = await cookies();
  const { url, key } = env();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a server component: the proxy has already refreshed the cookies.
        }
      },
    },
  });
}

// Runs before every page (proxy.ts): renews an expired session and writes the new cookies.
export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = env();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet, headers) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

// The signed-in user's id, checked by Supabase (not just read from the cookie). Null when signed out.
export async function currentUserId(): Promise<string | null> {
  const supabase = await authClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
}

export type SignUpResult = { userId: string } | { errorCode: string | undefined };

// Creates the account and signs the user in (no email confirmation in the MVP).
// The name is also kept on the account, so a missing profile can be recreated later (DECISIONS · story 9).
export async function signUpWithPassword(name: string, email: string, password: string): Promise<SignUpResult> {
  const supabase = await authClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) return { errorCode: error.code };
  // With email confirmation on, Supabase hides a used email: no session, no identities.
  if (!data.session || !data.user) return { errorCode: data.user?.identities?.length === 0 ? "user_already_exists" : "no_session" };
  return { userId: data.user.id };
}

export type SignedInUser = { id: string; email: string; name: string };

// The signed-in user's id and email, checked by Supabase. Null when signed out.
export async function currentUser(): Promise<SignedInUser | null> {
  const supabase = await authClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims.sub) return null;
  const metadata = data.claims.user_metadata as { name?: unknown } | undefined;
  return { id: data.claims.sub, email: String(data.claims.email ?? ""), name: String(metadata?.name ?? "") };
}

export type LogInResult = { userId: string; name: string } | { errorCode: string | undefined };

// Supabase Auth checks the password; the app only receives the session (in cookies) or an error code.
export async function logInWithPassword(email: string, password: string): Promise<LogInResult> {
  const supabase = await authClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { errorCode: error?.code };
  return { userId: data.user.id, name: String(data.user.user_metadata?.name ?? "") };
}

// Ends the session in Supabase and removes the cookies.
export async function logOut(): Promise<void> {
  const supabase = await authClient();
  await supabase.auth.signOut();
}

export type ChangePasswordResult = { ok: true } | { errorCode: string | undefined };

// Change password (bug 9). Supabase Auth checks the current password first (a fresh log-in with it), then sets the
// new one; the app never stores either. The session cookies are renewed by the log-in.
export async function changePassword(email: string, current: string, next: string): Promise<ChangePasswordResult> {
  const supabase = await authClient();
  const check = await supabase.auth.signInWithPassword({ email, password: current });
  if (check.error) return { errorCode: check.error.code };
  const { error } = await supabase.auth.updateUser({ password: next });
  return error ? { errorCode: error.code } : { ok: true };
}
