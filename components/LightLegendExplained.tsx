import { LIGHT_WORD, type Light } from "@/lib/rules/trafficLight";
import { LightLegend } from "@/components/TrafficLight";

// What each traffic-light word means (bug 4). Match and No match reuse the story 5
// summary wording; the Check line is a general form of "One check is uncertain".
const MEANING: Record<Light, string> = {
  green: "All three checks match this version",
  yellow: "At least one check is uncertain",
  red: "It's a different pressing",
};

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
