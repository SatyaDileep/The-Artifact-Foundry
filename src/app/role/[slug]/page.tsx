import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getRole, getRoles, getPublishedContentByRole } from "@/lib/queries";
import ArtifactCard from "@/components/ArtifactCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const role = await getRole(supabase, slug);

  if (!role) return { title: "Not found" };

  return {
    title: role.title,
    description: role.tagline,
  };
}

export default async function RolePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const role = await getRole(supabase, slug);

  if (!role) notFound();

  const [content, allRoles] = await Promise.all([
    getPublishedContentByRole(supabase, slug),
    getRoles(supabase),
  ]);
  const otherRoles = allRoles.filter((r) => r.id !== role.id);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <Link
        href="/#paths"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← All career paths
      </Link>

      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${role.accent} p-8 sm:p-10`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative flex flex-col gap-3">
          <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            Career path
          </span>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {role.title}
          </h1>
          <p className="max-w-xl text-lg text-white/90">{role.tagline}</p>
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-zinc-600 dark:text-zinc-400">
        {role.description}
      </p>

      <section className="mt-10">
        <h2 className="mb-1 text-xl font-semibold tracking-tight">
          Follow the signal
        </h2>
        <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
          The sources working professionals in this field actually cite —
          curated so you skip the noise.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {role.sources.map((source) => (
            <div
              key={source.id}
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {source.name}
                  </p>
                  {source.title && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {source.title}
                    </p>
                  )}
                </div>
                {source.domain && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {source.domain}
                  </span>
                )}
              </div>
              {source.note && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {source.note}
                </p>
              )}
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
                >
                  Visit source ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {content.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-semibold tracking-tight">
            Featured artifacts
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.map((c) => (
              <ArtifactCard key={c.id} content={c} />
            ))}
          </div>
        </section>
      )}

      {otherRoles.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Other paths
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherRoles.map((r) => (
              <Link
                key={r.id}
                href={`/role/${r.slug}`}
                className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-100 dark:hover:text-zinc-50"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
