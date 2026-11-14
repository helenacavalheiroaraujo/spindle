// Decision tables from story 28 (one album page for every album) and DECISIONS 2026-11-14.
import { describe, expect, it } from "vitest";
import { albumAction, fallbackTracks } from "@/lib/rules/albumAction";

describe("albumAction", () => {
  it.each([
    ["listings, no saved ranking", "open", null, { kind: "choose", href: "/albums/z/priorities" }],
    ["listings, empty saved ranking", "open", [], { kind: "choose", href: "/albums/z/priorities" }],
    [
      "listings, saved Price then Sound",
      "open",
      ["price", "sound"],
      {
        kind: "recommendation",
        href: "/albums/z/recommendation?priorities=price,sound",
        basedOn: "Price, Sound",
        changeHref: "/albums/z/priorities?priorities=price,sound",
      },
    ],
    ["no listings, no saved ranking", "no_listings", null, { kind: "nobody_selling" }],
    ["no listings, saved ranking", "no_listings", ["price"], { kind: "nobody_selling" }],
    ["not in the demo", "not_in_demo", ["price"], { kind: "none" }],
  ] as const)("%s", (_, access, saved, expected) => {
    expect(albumAction("z", access, saved ? [...saved] : null)).toEqual(expected);
  });
});

const t = (title: string, isExtra = false) => ({ position: "A1", title, isExtra });

describe("fallbackTracks", () => {
  it.each([
    ["no versions", [], []],
    ["versions without tracks", [{ releaseYear: 1972, tracks: [] }], []],
    [
      "earliest version wins",
      [
        { releaseYear: 2012, tracks: [t("Five Years"), t("Velvet Goldmine", true)] },
        { releaseYear: 1972, tracks: [t("Five Years"), t("Soul Love")] },
      ],
      ["Five Years", "Soul Love"],
    ],
    ["bonus tracks are left out", [{ releaseYear: 1990, tracks: [t("Starman"), t("Sweet Head", true)] }], ["Starman"]],
    [
      "earliest version without tracks is skipped",
      [
        { releaseYear: 1972, tracks: [] },
        { releaseYear: 1990, tracks: [t("Starman")] },
      ],
      ["Starman"],
    ],
    [
      "same year keeps the first version given",
      [
        { releaseYear: 1972, tracks: [t("UK")] },
        { releaseYear: 1972, tracks: [t("US")] },
      ],
      ["UK"],
    ],
  ])("%s", (_, versions, expected) => {
    expect(fallbackTracks(versions)).toEqual(expected);
  });
});
