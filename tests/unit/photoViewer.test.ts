// Decision table from bug 13 (design option A): which photos the viewer shows and how the arrows move.
import { describe, expect, it } from "vitest";
import { stepPhoto, viewerLabel, viewerPhotos } from "@/lib/rules/photoViewer";

describe("viewerPhotos", () => {
  it("shows cover, record and matrix in that order", () => {
    const list = viewerPhotos({ cover: "c.jpg", record: "r.jpg", matrix: "m.jpg" });
    expect(list.map((p) => p.kind)).toEqual(["cover", "record", "matrix"]);
    expect(list.map((p) => p.src)).toEqual(["c.jpg", "r.jpg", "m.jpg"]);
  });
  it("leaves out a photo that does not exist", () => {
    expect(viewerPhotos({ cover: "c.jpg", record: "r.jpg", matrix: null }).map((p) => p.kind)).toEqual(["cover", "record"]);
    expect(viewerPhotos({ cover: null, record: "r.jpg", matrix: "m.jpg" }).map((p) => p.kind)).toEqual(["record", "matrix"]);
  });
  it("is empty when there are no photos", () => {
    expect(viewerPhotos({ cover: null, record: null, matrix: null })).toEqual([]);
  });
});

describe("stepPhoto", () => {
  it.each([
    [0, 1, 3, 1],
    [1, 1, 3, 2],
    [2, 1, 3, 2], // stops at the last photo
    [2, -1, 3, 1],
    [0, -1, 3, 0], // stops at the first photo
    [0, 1, 1, 0], // one photo: nowhere to go
  ] as const)("index %i, step %i of %i photos → %i", (index, delta, count, expected) => {
    expect(stepPhoto(index, delta, count)).toBe(expected);
  });
});

describe("viewerLabel", () => {
  it.each([
    ["record", 0, 3, "Record · 1 of 3"],
    ["matrix", 2, 3, "Matrix · 3 of 3"],
    ["cover", 0, 2, "Cover · 1 of 2"],
  ] as const)("%s at %i of %i → %s", (kind, index, count, expected) => {
    expect(viewerLabel(kind, index, count)).toBe(expected);
  });
});
