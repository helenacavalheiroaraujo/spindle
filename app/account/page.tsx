import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { currentUser } from "@/lib/db/session";
import { getProfileName } from "@/lib/db/profiles";
import { LogOutButton } from "./LogOutButton";

// Your account (story 9 · use case 3): name, email and Log out. Private; not the public profile (out of scope).
// "My listings" is reached from here (story 8 · finding #13).
export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Faccount");
  const name = await getProfileName(user.id).catch(() => null);

  return (
    <main className="mx-auto max-w-md px-4 pb-16">
      <Header />
      <h1 className="mt-6 font-heading text-4xl leading-tight">Your account</h1>
      <dl className="mt-6 space-y-4 rounded-2xl border border-line bg-white/60 p-5">
        {name && (
          <div>
            <dt className="text-sm text-navy/70">Name</dt>
            <dd className="font-medium">{name}</dd>
          </div>
        )}
        <div>
          <dt className="text-sm text-navy/70">Email</dt>
          <dd className="break-all font-medium">{user.email}</dd>
        </div>
      </dl>
      <Link
        href="/my-listings"
        className="mt-4 flex min-h-14 items-center justify-between rounded-2xl border border-line bg-white/60 px-5 font-semibold"
      >
        My listings <span aria-hidden>›</span>
      </Link>
      <LogOutButton />
    </main>
  );
}
