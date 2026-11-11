// Decision tables from story 12: crates only for genres with albums (real counts), the genre screen newest
// first, and the featured album (most active listings among albums that open; newest on a tie; none → null).
import { describe, expect, it } from "vitest";
import { albumsInGenre, crates, featuredAlbum, genreFromSlug, isCrateRow, recordsLabel, showingLabel } from "@/lib/rules/home";

// Story 24 decision table: six or fewer crates is a grid; seven or more is a row with a progress line and a label.
describe("isCrateRow", () => {
  it.each([
    [0, false],
    [6, false],
    [7, true],
    [8, true],
  ])("%i crates → row? %s", (count, row) => expect(isCrateRow(count)).toBe(row));
});

describe("showingLabel", () => {
  it("shows the visible range and the total", () => {
    expect(showingLabel(1, 4, 7)).toBe("Showing 1 to 4 of 7 genres");
    expect(showingLabel(4, 7, 7)).toBe("Showing 4 to 7 of 7 genres");
  });
});

const albums = [
  { id: "ziggy", genre: "Rock", releaseYear: 1972 },
  { id: "hunky", genre: "Rock", releaseYear: 1971 },
  { id: "blackstar", genre: "Rock", releaseYear: 2016 },
  { id: "dance", genre: "Soul and funk", releaseYear: 1983 },
  { id: "homogenic", genre: "Electronic", releaseYear: 1997 },
  { id: "unfiled", genre: null, releaseYear: 2000 },
];

describe("crates", () => {
  it("one crate per genre with albums, in alphabetical order (story 24), with real counts", () => {
    expect(crates(albums).map((c) => [c.genre.name, c.count])).toEqual([
      ["Electronic", 1],
      ["Rock", 3],
      ["Soul and funk", 1],
    ]);
  });
  it("Classical has its own crate when it has albums", () => {
    expect(crates([{ genre: "Classical", releaseYear: 1999 }]).map((c) => c.genre.name)).toEqual(["Classical"]);
  });
  it("an album without a genre is in no crate", () => {
    expect(crates([{ genre: null, releaseYear: 2000 }])).toEqual([]);
  });
  it("no albums → no crates", () => {
    expect(crates([])).toEqual([]);
  });
});

describe("albumsInGenre", () => {
  it("only that genre's albums, newest first", () => {
    const rock = genreFromSlug("rock")!;
    expect(albumsInGenre(albums, rock).map((a) => a.id)).toEqual(["blackstar", "ziggy", "hunky"]);
  });
});

describe("genreFromSlug", () => {
  it.each([
    ["rock", "Rock"],
    ["soul-and-funk", "Soul and funk"],
    ["hip-hop", "Hip-hop"],
  ])("%s → %s", (slug, name) => expect(genreFromSlug(slug)?.name).toBe(name));
  it("an unknown slug → null", () => expect(genreFromSlug("polka")).toBeNull());
});

describe("featuredAlbum", () => {
  const f = (id: string, releaseYear: number, access: "open" | "no_listings" | "not_in_demo", activeListingCount: number) => ({
    id, releaseYear, access, activeListingCount,
  });
  it("the album that opens with the most active listings", () => {
    expect(featuredAlbum([f("a", 1972, "open", 6), f("b", 1973, "open", 3)])?.id).toBe("a");
  });
  it("albums that do not open are never featured, even with more listings", () => {
    expect(featuredAlbum([f("hunky", 1971, "not_in_demo", 9), f("b", 1973, "open", 3)])?.id).toBe("b");
  });
  it("a tie → the newest", () => {
    expect(featuredAlbum([f("a", 1972, "open", 3), f("b", 1983, "open", 3)])?.id).toBe("b");
  });
  it("the featured album sells out → the next one takes its place", () => {
    expect(featuredAlbum([f("a", 1972, "no_listings", 0), f("b", 1973, "open", 3)])?.id).toBe("b");
  });
  it("no album opens → null (the card is not shown)", () => {
    expect(featuredAlbum([f("a", 1972, "no_listings", 0), f("b", 1971, "not_in_demo", 2)])).toBeNull();
  });
});

describe("recordsLabel", () => {
  it.each([[1, "1 record"], [4, "4 records"]])("%i → %s", (n, label) => expect(recordsLabel(n)).toBe(label));
});
