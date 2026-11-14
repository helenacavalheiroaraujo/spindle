// Decision table from story 33 · "Pressing check" on every listing: word + meaning per light,
// and text on every card tint meets 4.5:1 (acceptance criterion). Colours are read from app/globals.css.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LIGHT_MEANING, LIGHT_WORD, type Light } from "@/lib/rules/trafficLight";

describe("pressing check line", () => {
  it.each([
    ["green", "Match", "All three checks match this version"],
    ["yellow", "Check", "At least one check is uncertain"], // also "Moved here · check pending" (story 5)
    ["red", "No match", "It's a different pressing"],
  ] as const)("%s → %s: %s", (light: Light, word, meaning) => {
    expect(LIGHT_WORD[light]).toBe(word);
    expect(LIGHT_MEANING[light]).toBe(meaning);
  });
});

const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
const colour = (name: string) => {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, "i"));
  if (!m) throw new Error(`--color-${name} not found`);
  return [1, 3, 5].map((i) => parseInt(m[1].slice(i, i + 2), 16));
};
type RGB = number[];
// Colour `top` at opacity `a` over `bottom` (Tailwind's text-navy/70, bg-white/70).
const over = (top: RGB, a: number, bottom: RGB): RGB => top.map((c, i) => c * a + bottom[i] * (1 - a));
const luminance = (rgb: RGB) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("card tints: text contrast at least 4.5:1", () => {
  const navy = colour("navy");
  const white: RGB = [255, 255, 255];
  it.each(["tint-green", "tint-amber", "tint-red"])("%s", (tint) => {
    const bg = colour(tint);
    const line = over(white, 0.7, bg); // the "Pressing check" line (bg-white/70)
    const hover = over(colour("sand"), 0.6, bg); // listing link on hover (bg-sand/60)
    for (const b of [bg, line, hover]) {
      expect(contrast(navy, b)).toBeGreaterThanOrEqual(4.5); // running text
      expect(contrast(over(navy, 0.7, b), b)).toBeGreaterThanOrEqual(4.5); // muted text (text-navy/70)
    }
  });
});
