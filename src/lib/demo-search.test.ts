import { describe, it, expect } from "vitest";
import { demoSearch, tokenize } from "./demo-search";

describe("tokenize", () => {
  it("lowercases, strips punctuation, drops stopwords and short tokens", () => {
    expect(tokenize("How do habits actually form?")).toEqual([
      "habits",
      "actually",
      "form",
    ]);
  });
});

describe("demoSearch", () => {
  it("finds artifacts by topic", () => {
    const { answer, hits } = demoSearch("how do habits form?");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].slug).toBe("atomic-habits");
    expect(answer).toMatch(/\(\d+ artifacts? matched\)/);
    expect(answer).toContain("[1]");
  });

  it("matches money-related quotes", () => {
    const { hits } = demoSearch("wealth vs rich");
    expect(hits.some((h) => h.slug === "psychology-of-money")).toBe(true);
  });

  it("limits to four hits and returns artifact links data", () => {
    const { hits } = demoSearch("design systems product engineers");
    expect(hits.length).toBeLessThanOrEqual(4);
    for (const h of hits) {
      expect(h.slug).toBeTruthy();
      expect(h.title).toBeTruthy();
      expect(h.snippet.length).toBeGreaterThan(0);
    }
  });

  it("answers gracefully with no matches", () => {
    const { answer, hits } = demoSearch("quantum entanglement");
    expect(hits).toEqual([]);
    expect(answer).toContain("Nothing in the demo library matched");
  });
});
