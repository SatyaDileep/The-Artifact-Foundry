"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getRandomQuote } from "@/lib/queries";
import type { RandomQuote } from "@/lib/types";

export default function InspireMe() {
  const [quote, setQuote] = useState<RandomQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inspire = async () => {
    setLoading(true);
    setError(null);
    try {
      const client = createClient();
      const result = await getRandomQuote(client);
      setQuote(result);
    } catch {
      setError("Could not load an inspiration. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={inspire}
        disabled={loading}
        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 disabled:opacity-60"
      >
        {loading ? "Finding insight…" : "✨ Inspire Me"}
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {quote && !loading && (
        <div className="w-full max-w-2xl rounded-2xl border border-amber-200 bg-white p-6 shadow-lg dark:border-amber-900 dark:bg-zinc-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Random insight
          </span>
          <p className="mt-3 text-xl font-medium leading-relaxed text-zinc-900 dark:text-zinc-50">
            &ldquo;{quote.text}&rdquo;
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {quote.content?.title}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {quote.content?.category?.name ?? "General"}
              </p>
            </div>
            <Link
              href={`/artifact/${quote.content?.slug ?? quote.content_id}`}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Explore
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
