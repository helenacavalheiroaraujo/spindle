import { LIGHT_WORD, type Light } from "@/lib/rules/trafficLight";

const DOT: Record<Light, string> = { green: "bg-green-600", yellow: "bg-amber-400", red: "bg-red-600" };

// Traffic light pill (story 5): always shows its word, never colour alone (CLAUDE.md).
export function TrafficLight({ light }: { light: Light }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white/70 px-2.5 py-1 text-xs font-semibold">
      <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${DOT[light]}`} />
      {LIGHT_WORD[light]}
    </span>
  );
}

export function LightLegend() {
  return (
    <ul aria-label="Traffic light" className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {(["green", "yellow", "red"] as const).map((l) => (
        <li key={l} className="flex items-center gap-1.5">
          <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${DOT[l]}`} />
          {LIGHT_WORD[l]}
        </li>
      ))}
    </ul>
  );
}
