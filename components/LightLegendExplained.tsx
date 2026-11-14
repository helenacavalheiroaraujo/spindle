import { LIGHT_MEANING as MEANING, LIGHT_WORD } from "@/lib/rules/trafficLight";
import { LightLegend } from "@/components/TrafficLight";

// What each traffic-light word means (bug 4). No longer shown on the listings since story 33
// (each listing explains itself with its "Pressing check" line); kept, not deleted.

// The legend plus a "What do these mean?" disclosure. Words always show, never colour alone.
export function LightLegendExplained() {
  return (
    <div>
      <LightLegend />
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer font-semibold underline">What do these mean?</summary>
        <ul className="mt-2 space-y-1">
          {(["green", "yellow", "red"] as const).map((l) => (
            <li key={l}>
              <span className="font-semibold">{LIGHT_WORD[l]}:</span> {MEANING[l]}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
