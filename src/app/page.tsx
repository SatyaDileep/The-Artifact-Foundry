import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getPublishedContent, getRoles } from "@/lib/queries";
import ArtifactCard from "@/components/ArtifactCard";
import CategoryFilter from "@/components/CategoryFilter";
import InspireMe from "@/components/InspireMe";
import RoleCard from "@/components/RoleCard";

export const metadata = {
  title: "Path-Directed Learning Artifacts",
  description:
    "Content is abundant, taste is not. Curated career paths with quotes, top moments, and flashcards from what working professionals actually follow.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [categories, content, roles] = await Promise.all([
    getCategories(supabase),
    getPublishedContent(supabase, category),
    getRoles(supabase),
  ]);

  const activeCategory =
    categories.find((c) => c.slug === category)?.name ?? "All";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Content is abundant.{" "}
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            Taste is not.
          </span>
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Path-directed summaries and inspirational quotes — what working
          professionals actually follow — distilled into learning artifacts.
        </p>
        <InspireMe />
        <Link
          href="/ask"
          className="mt-2 text-sm font-medium text-amber-700 underline-offset-4 hover:underline dark:text-amber-400"
        >
          …or ask the library a question
        </Link>
      </section>

      <section id="paths" className="mb-12 scroll-mt-24">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Career paths</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Follow the signal, not the noise
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </section>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          Browse artifacts
        </h2>
        <CategoryFilter categories={categories} />
      </div>

      {content.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.map((c) => (
            <ArtifactCard key={c.id} content={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
            No artifacts in &ldquo;{activeCategory}&rdquo; yet.
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Check back soon — new content is being curated.
          </p>
        </div>
      )}
    </main>
  );
}
