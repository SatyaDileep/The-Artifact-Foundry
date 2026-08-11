import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPublishedContent, getRoles } from "@/lib/queries";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [content, roles] = await Promise.all([
    getPublishedContent(supabase),
    getRoles(supabase),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/ask`, changeFrequency: "weekly", priority: 0.8 },
  ];

  for (const role of roles) {
    entries.push({
      url: `${baseUrl}/role/${role.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const artifact of content) {
    entries.push({
      url: `${baseUrl}/artifact/${artifact.slug}`,
      lastModified: artifact.created_at,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
