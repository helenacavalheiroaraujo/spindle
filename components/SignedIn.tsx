"use client";
// Whether someone is signed in, and their name, for the menu (stories 15, 19). The root layout (server) reads the
// session and puts the answer here, because Header is also used inside client error screens that cannot read it themselves.
import { createContext, useContext } from "react";

const SignedInContext = createContext({ signedIn: false, name: "" });

export function SignedInProvider({ signedIn, name = "", children }: { signedIn: boolean; name?: string; children: React.ReactNode }) {
  return <SignedInContext.Provider value={{ signedIn, name }}>{children}</SignedInContext.Provider>;
}

export const useSignedIn = () => useContext(SignedInContext).signedIn;
export const useAccountName = () => useContext(SignedInContext).name;
