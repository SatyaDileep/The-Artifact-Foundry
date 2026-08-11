import Link from "next/link";
import type { Content } from "@/lib/types";

export default function ArtifactCard({ content }: { content: Content }) {
  const quoteCount = content.quotes?.length ?? 0;
  const flashcardCount = content.flashcards?.length ?? 0;

  return (
    <Link
      href={`/artifact/${content.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600">
        {content.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.cover_image_url}
            alt={content.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6">
            <p className="line-clamp-3 text-center font-serif text-lg font-medium text-white/90">
              &ldquo;{content.quotes?.[0]?.text ?? content.title}&rdquo;
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-zinc-800">
          {content.category?.name ?? "General"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          {content.title}
        </h3>

        {content.quotes?.[0] && (
          <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
            &ldquo;{content.quotes[0].text}&rdquo;
          </p>
        )}

        <div className="mt-auto flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="font-semibold">{quoteCount}</span> quotes
          </span>
          <span className="flex items-center gap-1">
            <span className="font-semibold">{flashcardCount}</span> flashcards
          </span>
        </div>
      </div>
    </Link>
  );
}
