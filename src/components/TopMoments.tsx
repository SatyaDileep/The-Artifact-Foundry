import type { TopMoment } from "@/lib/types";

export default function TopMoments({ moments }: { moments: TopMoment[] }) {
  if (!moments || moments.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Top Moments
      </h2>
      <div className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {moments.map((moment, i) => (
          <div
            key={moment.id}
            className="flex gap-4 bg-white p-4 dark:bg-zinc-900"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              {i + 1}
            </span>
            <div className="flex-1">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                {moment.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {moment.summary}
              </p>
              {moment.timestamp_ref && (
                <span className="mt-2 inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {moment.timestamp_ref}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
