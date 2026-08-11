import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, Content, RandomQuote, Role } from "./types";
import {
  demoCategories,
  demoContent,
  demoRoles,
  getDemoRole,
  isDemoMode,
  randomDemoQuote,
} from "./demo-data";

const CONTENT_SELECT = `
  *,
  category:categories(*),
  quotes(*),
  flashcards(*),
  top_moments(*)
`;

export async function getCategories(
  client: SupabaseClient,
): Promise<Category[]> {
  if (isDemoMode) return demoCategories;

  const { data, error } = await client
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublishedContent(
  client: SupabaseClient,
  categorySlug?: string,
): Promise<Content[]> {
  if (isDemoMode) {
    let result = demoContent.filter((c) => c.is_published);
    if (categorySlug && categorySlug !== "all") {
      result = result.filter((c) => c.category?.slug === categorySlug);
    }
    return result;
  }

  let query = client
    .from("content")
    .select(CONTENT_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (categorySlug && categorySlug !== "all") {
    query = query.eq("category.slug", categorySlug);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getArtifact(
  client: SupabaseClient,
  slug: string,
): Promise<Content | null> {
  if (isDemoMode) {
    return (
      demoContent.find((c) => c.slug === slug || c.id === slug) ?? null
    );
  }

  const { data, error } = await client
    .from("content")
    .select(CONTENT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getRandomQuote(
  client: SupabaseClient,
): Promise<RandomQuote | null> {
  if (isDemoMode) return randomDemoQuote();

  const { data, error } = await client
    .from("quotes")
    .select("*, content:content!inner(*, category:categories(*))")
    .eq("content.is_published", true)
    .limit(100);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null;

  const pool = data as unknown as RandomQuote[];
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function getAllContent(
  client: SupabaseClient,
): Promise<Content[]> {
  if (isDemoMode) return demoContent;

  const { data, error } = await client
    .from("content")
    .select(CONTENT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRoles(client: SupabaseClient): Promise<Role[]> {
  if (isDemoMode) return demoRoles;

  const { data, error } = await client
    .from("roles")
    .select("*, sources:role_sources(*)")
    .order("sort_order");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRole(
  client: SupabaseClient,
  slug: string,
): Promise<Role | null> {
  if (isDemoMode) return getDemoRole(slug);

  const { data, error } = await client
    .from("roles")
    .select("*, sources:role_sources(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getPublishedContentByRole(
  client: SupabaseClient,
  roleSlug: string,
): Promise<Content[]> {
  if (isDemoMode) {
    return demoContent.filter(
      (c) => c.is_published && c.role_slugs?.includes(roleSlug),
    );
  }

  const { data, error } = await client
    .from("content")
    .select(CONTENT_SELECT)
    .eq("is_published", true)
    .contains("role_slugs", [roleSlug])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
