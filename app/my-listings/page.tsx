import { redirect } from "next/navigation";

// /my-listings opens the For sale tab of Your account (story 31). Old links keep working.
export default function MyListingsPage() {
  redirect("/account/for-sale");
}
