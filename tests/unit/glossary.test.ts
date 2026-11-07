// Decision table from SPEC story 3 · Acceptance criteria (glossary terms, finding #17).
import { describe, expect, it } from "vitest";
import { splitByTerms } from "@/lib/rules/glossary";

const terms = [
  { term: "pressing", explanation: "One batch." },
  { term: "first pressing", explanation: "The very first batch." },
  { term: "remaster", explanation: "New version of the sound." },
  { term: "VG+", explanation: "Very good." },
];
const marked = (text: string) => splitByTerms(text, terms).filter((s) => s.term).map((s) => s.term!.term);

describe("splitByTerms", () => {
  it.each([
    ["finds a term ignoring case", "2012 Remaster", ["remaster"]],
    ["longer term wins", "vs €185 for a first pressing", ["first pressing"]],
    ["finds several terms", "A remaster, not a first pressing; any pressing", ["remaster", "first pressing", "pressing"]],
    ["whole words only", "remastered pressings", []],
    ["term ending in a symbol", "Copy in VG+ condition", ["VG+"]],
    ["no term", "Costs €32", []],
  ] as const)("%s", (_case, text, expected) => {
    expect(marked(text)).toEqual(expected);
  });

  it("keeps the whole text, in order", () => {
    const text = "Costs €32, vs typically €150–€220 for a first pressing.";
    expect(splitByTerms(text, terms).map((s) => s.text).join("")).toBe(text);
  });

  it("keeps the original spelling of the term", () => {
    expect(splitByTerms("2012 Remaster", terms)[1].text).toBe("Remaster");
  });
});
