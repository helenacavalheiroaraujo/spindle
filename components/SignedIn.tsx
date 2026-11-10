"use client";
// Whether someone is signed in, their name, and the records in their cart, for the menu and the listings (stories 15, 19, 20).
// The root layout (server) reads the session and puts the answer here, because Header is also used inside client error
// screens that cannot read it themselves.
import { createContext, useContext } from "react";

const SignedInContext = createContext({ signedIn: false, name: "", cartIds: [] as string[] });

export function SignedInProvider({
  signedIn,
  name = "",
  cartIds = [],
  children,
}: {
  signedIn: boolean;
  name?: string;
  cartIds?: string[]; // listings in the buyer's cart that are still on sale (story 20)
  children: React.ReactNode;
}) {
  return <SignedInContext.Provider value={{ signedIn, name, cartIds }}>{children}</SignedInContext.Provider>;
}

export const useSignedIn = () => useContext(SignedInContext).signedIn;
export const useAccountName = () => useContext(SignedInContext).name;
export const useCartCount = () => useContext(SignedInContext).cartIds.length;
export const useInCart = (listingId: string) => useContext(SignedInContext).cartIds.includes(listingId);
