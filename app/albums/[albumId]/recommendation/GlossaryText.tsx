"use client";
import { useState } from "react";
import { splitByTerms, type GlossaryTerm } from "@/lib/rules/glossary";

// Text in which every glossary term can be tapped to show its plain explanation (finding #17).
export function GlossaryText({ text, terms }: { text: string; terms: GlossaryTerm[] }) {
  return (
    <>
      {splitByTerms(text, terms).map((segment, i) =>
        segment.term ? <Term key={i} text={segment.text} explanation={segment.term.explanation} /> : segment.text,
      )}
    </>
  );
}

function Term({ text, explanation }: { text: string; explanation: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="cursor-help underline decoration-dotted decoration-2 underline-offset-4"
      >
        {text}
      </button>
      {open && (
        <span role="note" className="mx-1 rounded-md bg-navy/10 px-1.5 py-0.5 text-[0.85em] font-normal">
          {explanation}
        </span>
      )}
    </>
  );
}
