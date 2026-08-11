import { describe, it, expect, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCategories,
  getPublishedContent,
  getArtifact,
  getRoles,
  getRole,
  getPublishedContentByRole,
} from "./queries";

// In demo mode the queries never touch a real client — any object works.
const fakeClient = {} as unknown as SupabaseClient;

beforeEach(() => {
  process.env.NEXT_PUBLIC_DEMO_MODE = "true";
});

describe("queries in demo mode", () => {
  it("returns demo categories", async () => {
    const categories = await getCategories(fakeClient);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty("slug");
  });

  it("returns only published content, filterable by category", async () => {
    const all = await getPublishedContent(fakeClient);
    expect(all.every((c) => c.is_published)).toBe(true);

    const filtered = await getPublishedContent(fakeClient, "productivity");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((c) => c.category?.slug === "productivity")).toBe(true);
  });

  it("getArtifact finds by slug", async () => {
    const artifact = await getArtifact(fakeClient, "atomic-habits");
    expect(artifact?.title).toContain("Atomic Habits");
  });

  it("getRoles and getRole resolve with sources", async () => {
    const roles = await getRoles(fakeClient);
    expect(roles.length).toBeGreaterThan(0);

    const role = await getRole(fakeClient, "product-manager");
    expect(role?.sources.length).toBeGreaterThan(0);
  });

  it("getPublishedContentByRole filters by role slug", async () => {
    const items = await getPublishedContentByRole(fakeClient, "software-architect");
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((c) => c.role_slugs?.includes("software-architect"))).toBe(true);
  });
});
