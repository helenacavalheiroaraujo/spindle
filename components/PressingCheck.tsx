import { LIGHT_MEANING, LIGHT_WORD, type Light } from "@/lib/rules/trafficLight";

// Story 33 (option A + Colour 3, docs/design/traffic-light-redesign-options.html): each listing card is
// tinted with its light's colour and has a thin border of the same colour; the word is always written too.
export const CARD_TINT: Record<Light, string> = {
  green: "bg-tint-green border-light-green",
  yellow: "bg-tint-amber border-light-amber",
  red: "bg-tint-red border-light-red",
};

const DOT: Record<Light, string> = { green: "bg-light-green", yellow: "bg-light-amber", red: "bg-light-red" };

// "Pressing check · Match", its meaning in one sentence, then "See the checks" (story 33, option A).
export function PressingCheck({ light }: { light: Light }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-line bg-white/70 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-navy/70">Pressing check</span>
      <span className="sr-only"> · </span>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-cream px-2.5 py-0.5 text-xs font-semibold">
        <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${DOT[light]}`} />
        {LIGHT_WORD[light]}
      </span>
      <span>{LIGHT_MEANING[light]}</span>
      <span className="font-semibold underline underline-offset-4">See the checks</span>
    </p>
  );
}
