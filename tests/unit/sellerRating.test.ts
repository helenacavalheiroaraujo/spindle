// Decision table from SPEC story 18 · Acceptance criteria.
import { describe, expect, it } from "vitest";
import { canRate, canSendReview, isValidRating, ratingText, starsText, summarize } from "@/lib/rules/sellerRating";

describe("summarize + ratingText", () => {
  it.each([
    [[], "No reviews yet"],
    [[5], "★ 5.0 · 1 review"],
    [[4, 5], "★ 4.5 · 2 reviews"],
    [[5, 4, 5, 4, 4], "★ 4.4 · 5 reviews"],
    [[5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4], "★ 4.8 · 12 reviews"], // 4.75 rounds up
    [[1, 1, 2], "★ 1.3 · 3 reviews"],
  ] as const)("%j → %s", (ratings, text) => {
    expect(ratingText(summarize([...ratings]))).toBe(text);
  });

  it("no reviews: count 0 and no average", () => {
    expect(summarize([])).toEqual({ count: 0, average: null });
  });
});

describe("isValidRating", () => {
  it.each([
    [1, true], [3, true], [5, true],
    [0, false], [6, false], [-1, false], [4.5, false], [NaN, false], ["4", false], [null, false], [undefined, false],
  ] as const)("%j → %s", (value, ok) => {
    expect(isValidRating(value)).toBe(ok);
  });
});

describe("the question", () => {
  it.each([
    [null, false, "Choose from 1 to 5 stars"],
    [4, true, "4 of 5 stars"],
    [1, true, "1 of 5 stars"],
  ] as const)("star %j → Send review enabled %s, says %s", (chosen, enabled, text) => {
    expect(canSendReview(chosen)).toBe(enabled);
    expect(starsText(chosen)).toBe(text);
  });

  it.each([
    ["seller_paid", false, true], // delivered, not rated: Rate this seller
    ["seller_paid", true, false], // already rated: the question does not come back
    ["paid_waiting_seller", false, false], // not delivered yet: cannot rate
    ["paid_waiting_seller", true, false],
  ] as const)("order %s, reviewed %s → can rate %s", (status, reviewed, expected) => {
    expect(canRate(status, reviewed)).toBe(expected);
  });
});
