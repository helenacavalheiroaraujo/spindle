// Header initials when signed in (story 9): covered by tests/unit/initials.test.ts.
// First letter of the first and of the last word, upper case; one word → one letter.
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
