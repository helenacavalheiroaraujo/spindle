"use client";
// The Your account tabs (story 31, option C): underlined, with counts. Each tab is a link to its own address, so the
// menu (story 32) and other pages can open the right one and a reload keeps it. The selected tab is underlined and
// marked with aria-current for screen readers, not by colour alone. Tab and Enter reach and open every tab.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_TABS, accountTabFor, tabCount, type AccountCounts } from "@/lib/rules/accountTabs";

export function AccountTabs({ counts }: { counts: AccountCounts | null }) {
  const selected = accountTabFor(usePathname());
  return (
    <nav aria-label="Your account" className="mt-3 overflow-x-auto border-b border-line lg:mt-[18px]">
      <ul className="flex gap-5 lg:gap-[26px]">
        {ACCOUNT_TABS.map((tab) => {
          const on = tab.id === selected;
          const n = tabCount(tab.id, counts);
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={on ? "page" : undefined}
                className={`-mb-px flex min-h-12 items-center whitespace-nowrap border-b-[3px] font-semibold lg:text-base ${
                  on ? "border-navy text-navy" : "border-transparent text-navy/70 hover:text-navy"
                }`}
              >
                {tab.label}
                {n !== null && (
                  <span className="ml-1.5 inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full border border-line bg-sand px-1.5 text-xs">
                    <span className="sr-only"> (</span>
                    {n}
                    <span className="sr-only">)</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
