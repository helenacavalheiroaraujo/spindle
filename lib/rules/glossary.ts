// Glossary terms in a text (story 3 · finding #17): every glossary term shows its plain explanation
// wherever it appears. Matching ignores case and only takes whole words; longer terms win
// ("first pressing" before "pressing").

export type GlossaryTerm = { term: string; explanation: string };
export type Segment = { text: string; term?: GlossaryTerm };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function splitByTerms(text: string, terms: GlossaryTerm[]): Segment[] {
  if (terms.length === 0 || text === "") return text ? [{ text }] : [];
  const sorted = [...terms].sort((a, b) => b.term.length - a.term.length);
  // Whole words: no letter or digit right before or after the term ("VG+" ends in a symbol).
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(${sorted.map((t) => escape(t.term)).join("|")})(?![\\p{L}\\p{N}])`, "giu");
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index!;
    if (start > last) segments.push({ text: text.slice(last, start) });
    const term = sorted.find((t) => t.term.toLowerCase() === match[0].toLowerCase())!;
    segments.push({ text: match[0], term });
    last = start + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}
