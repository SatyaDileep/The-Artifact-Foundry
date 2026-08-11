import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getArtifact } from "@/lib/queries";
import TopMoments from "@/components/TopMoments";
import FlipCard from "@/components/FlipCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const content = await getArtifact(supabase, slug);

  if (!content || !content.is_published) {
    return { title: "Not found" };
  }

  return {
    title: content.title,
    description: content.quotes?.[0]?.text ?? "A curated learning artifact.",
    openGraph: {
      title: content.title,
      description: content.quotes?.[0]?.text ?? undefined,
      images: content.cover_image_url ? [{ url: content.cover_image_url }] : undefined,
    },
  };
}

export default async function ArtifactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const content = await getArtifact(supabase, slug);

  if (!content || !content.is_published) notFound();

  const flashcards = content.flashcards ?? [];
  const moments = content.top_moments ?? [];
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    "http://localhost:3000";

  return (
    <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: content.title,
            description: content.quotes?.[0]?.text ?? undefined,
            datePublished: content.created_at,
            url: `${baseUrl}/artifact/${content.slug}`,
            keywords: content.tags?.join(", ") ?? undefined,
            ...(content.cover_image_url
              ? { image: content.cover_image_url }
              : {}),
          }),
        }}
      />
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to feed
      </Link>

      <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 sm:h-72">
        {content.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.cover_image_url}
            alt={content.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8">
            <p className="text-center font-serif text-2xl font-medium text-white">
              &ldquo;{content.quotes?.[0]?.text ?? content.title}&rdquo;
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          {content.category?.name ?? "General"}
        </span>
        {content.platform && (
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {content.platform}
          </span>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {content.title}
      </h1>

      <div className="mt-8 flex flex-col gap-8">
        <TopMoments moments={moments} />

        {flashcards.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Flashcards
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {flashcards.map((card) => (
                <FlipCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        )}

        {content.tags && content.tags.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {content.source_url && (
          <a
            href={content.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.02]"
          >
            Go to Source
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
