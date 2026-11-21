// Which pages show the search in the desktop header (story 38). The sell pages have their own search (story 8); the
// purchase pages (cart, checkouts) and the account pages have none, so nothing pulls the buyer away. Every other page,
// where one looks for records, keeps it.
const WITHOUT_SEARCH = ["/sell", "/cart", "/checkout", "/account"];

export function showsHeaderSearch(path: string): boolean {
  return !WITHOUT_SEARCH.some((start) => path === start || path.startsWith(`${start}/`));
}
