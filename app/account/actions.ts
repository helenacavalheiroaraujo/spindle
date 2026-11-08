"use server";
// Log out (story 9 · use case 3): signed out, back to the home page.
import { redirect } from "next/navigation";
import { logOut } from "@/lib/db/session";

export type LogOutState = { failed: boolean };

export async function logOutAction(_prev: LogOutState): Promise<LogOutState> {
  try {
    await logOut();
  } catch {
    return { failed: true };
  }
  redirect("/");
}
