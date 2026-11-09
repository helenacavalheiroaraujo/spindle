"use client";
// Whether someone is signed in, for the menu (story 15). The root layout (server) reads the session and puts the answer
// here, because Header is also used inside client error screens that cannot read it themselves.
import { createContext, useContext } from "react";

const SignedInContext = createContext(false);

export function SignedInProvider({ signedIn, children }: { signedIn: boolean; children: React.ReactNode }) {
  return <SignedInContext.Provider value={signedIn}>{children}</SignedInContext.Provider>;
}

export const useSignedIn = () => useContext(SignedInContext);
