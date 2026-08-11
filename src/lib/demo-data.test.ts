import { describe, it, expect } from "vitest";
import {
  demoContent,
  demoRoles,
  demoCategories,
  getDemoRole,
  randomDemoQuote,
} from "./demo-data";

describe("demo content integrity", () => {
  it("has unique ids and slugs", () => {
    const ids = demoContent.map((c) => c.id);
    const slugs = demoContent.map((c) => c.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every published artifact has at least one quote", () => {
    for (const c of demoContent.filter((c) => c.is_published)) {
      expect(c.quotes.length).toBeGreaterThan(0);
    }
  });

  it("role_slugs point at real roles", () => {
    const roleSlugs = new Set(demoRoles.map((r) => r.slug));
    for (const c of demoContent) {
      for (const rs of c.role_slugs ?? []) {
        expect(roleSlugs.has(rs), `${c.slug} references unknown role ${rs}`).toBe(true);
      }
    }
  });

  it("categories referenced by content exist", () => {
    const categoryIds = new Set(demoCategories.map((c) => c.id));
    for (const c of demoContent) {
      expect(c.category, `${c.slug} has no category`).not.toBeNull();
      expect(categoryIds.has(c.category!.id)).toBe(true);
    }
  });
});

describe("demo roles", () => {
  it("have unique slugs and ordered sources with links", () => {
    const slugs = demoRoles.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const role of demoRoles) {
      expect(role.sources.length).toBeGreaterThan(0);
      for (const source of role.sources) {
        expect(source.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it("getDemoRole resolves by slug and returns null for unknown", () => {
    expect(getDemoRole("product-manager")?.name).toBe("Product Manager");
    expect(getDemoRole("nope")).toBeNull();
  });
});

describe("randomDemoQuote", () => {
  it("returns a quote tied to a content artifact", () => {
    const quote = randomDemoQuote();
    expect(quote).not.toBeNull();
    expect(quote!.content.title.length).toBeGreaterThan(0);
    expect(quote!.text.length).toBeGreaterThan(0);
  });
});
