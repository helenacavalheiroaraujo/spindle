"use client";
// Whether someone is signed in, their name, and the records in their cart, for the menu and the listings (stories 15, 19, 20).
// The root layout (server) reads the session and puts the answer here, because Header is also used inside client error
// screens that cannot read it themselves.
import { createContext, useContext } from "react";

const SignedInContext = createContext({ signedIn: false, name: "", email: "", cartIds: [] as string[] });

export function SignedInProvider({
  signedIn,
  name = "",
  email = "",
  cartIds = [],
  children,
}: {
  signedIn: boolean;
  name?: string;
  email?: string; // shown in the account menu (story 32)
  cartIds?: string[]; // listings in the buyer's cart that are still on sale (story 20)
  children: React.ReactNode;
}) {
  return <SignedInContext.Provider value={{ signedIn, name, email, cartIds }}>{children}</SignedInContext.Provider>;
}

export const useSignedIn = () => useContext(SignedInContext).signedIn;
export const useAccountName = () => useContext(SignedInContext).name;
export const useAccountEmail = () => useContext(SignedInContext).email;
export const useCartCount = () => useContext(SignedInContext).cartIds.length;
export const useInCart = (listingId: string) => useContext(SignedInContext).cartIds.includes(listingId);
