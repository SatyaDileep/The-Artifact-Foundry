import { describe, it, expect, afterEach } from "vitest";
import {
  slugify,
  getAdminEmails,
  isAdminAllowed,
  splitTranscript,
  buildContentChunks,
  estimateTokens,
} from "./utils";
import type { Content } from "./types";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("How to Build Habits")).toBe("how-to-build-habits");
  });

  it("strips apostrophes and special characters", () => {
    expect(slugify("What's the 1% rule?")).toBe("whats-the-1-rule");
  });

  it("collapses repeated separators and trims edges", () => {
    expect(slugify("  Atomic---Habits  ")).toBe("atomic-habits");
  });

  it("caps at 120 chars", () => {
    expect(slugify("a".repeat(300))).toHaveLength(120);
  });
});

describe("admin allowlist", () => {
  it("parses comma-separated ADMIN_EMAILS", () => {
    process.env.ADMIN_EMAILS = " A@X.com , b@y.com ";
    expect(getAdminEmails()).toEqual(["a@x.com", "b@y.com"]);
  });

  it("allows listed emails case-insensitively", () => {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    process.env.ADMIN_EMAILS = "curator@example.com";
    expect(isAdminAllowed("CURATOR@example.com")).toBe(true);
  });

  it("rejects unlisted and missing emails", () => {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    process.env.ADMIN_EMAILS = "curator@example.com";
    expect(isAdminAllowed("other@example.com")).toBe(false);
    expect(isAdminAllowed(null)).toBe(false);
    expect(isAdminAllowed(undefined)).toBe(false);
  });

  it("never blocks in demo mode", () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";
    expect(isAdminAllowed("anyone@example.com")).toBe(true);
  });
});

describe("splitTranscript", () => {
  it("returns a single chunk for short text", () => {
    expect(splitTranscript("Short transcript.")).toEqual(["Short transcript."]);
  });

  it("splits long text into windows with overlap", () => {
    const text = Array.from({ length: 40 }, (_, i) => `Sentence number ${i}.`).join(" ");
    const chunks = splitTranscript(text, 400, 80);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(400 + 150);
    }
  });

  it("handles empty input", () => {
    expect(splitTranscript("")).toEqual([]);
  });
});

describe("buildContentChunks", () => {
  const content: Content = {
    id: "c1",
    slug: "atomic-habits",
    title: "Atomic Habits",
    category: { id: "cat1", name: "Productivity", slug: "productivity" },
    tags: ["Habits", "Identity"],
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    quotes: [
      { id: "q1", content_id: "c1", text: "You fall to the level of your systems.", timestamp: "12:40" },
    ],
    flashcards: [
      { id: "f1", content_id: "c1", front: "What is habit stacking?", back: "Pair a new habit with an existing one." },
    ],
    top_moments: [
      { id: "m1", content_id: "c1", title: "Systems beat goals", summary: "Winners share goals, not systems.", timestamp_ref: "06:20" },
    ],
    transcript: "The first law of behavior change is to make it obvious.",
  };

  it("builds a deterministic title chunk", () => {
    const chunks = buildContentChunks(content);
    expect(chunks[0].text).toContain("Atomic Habits");
    expect(chunks[0].text).toContain("#Habits");
    expect(chunks[0].text).toContain("Productivity");
  });

  it("includes quotes, flashcards, moments, and transcript", () => {
    const chunks = buildContentChunks(content);
    const all = chunks.map((c) => c.text).join("\n");
    expect(all).toContain("Quote (12:40)");
    expect(all).toContain("Flashcard — Q:");
    expect(all).toContain("Key moment (");
    expect(all).toContain("Transcript excerpt:");
  });

  it("assigns sequential indexes and positive token counts", () => {
    const chunks = buildContentChunks(content);
    chunks.forEach((c, i) => expect(c.index).toBe(i));
    chunks.forEach((c) => expect(c.tokens).toBeGreaterThan(0));
    expect(estimateTokens("hello world")).toBeGreaterThan(0);
  });
});
