"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/demo-data";
import { demoSearch, type DemoHit } from "@/lib/demo-search";

interface AskSource {
  slug: string;
  title: string;
  category_name: string | null;
  chunk_text: string;
}

interface AskResult {
  answer: string;
  sources: AskSource[];
  retrieval: "vector" | "keyword";
  error?: string;
}

export default function AskWidget() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [demoHits, setDemoHits] = useState<DemoHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    const q = question.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setDemoHits(null);

    try {
      if (isDemoMode) {
        const { answer, hits } = demoSearch(q);
        await new Promise((r) => setTimeout(r, 350)); // simulate thinking
        setResult({ answer, sources: [], retrieval: "keyword" });
        setDemoHits(hits);
        return;
      }

      const client = createClient();
      const { data, error: invokeError } = await client.functions.invoke<AskResult>(
        "ask",
        { body: { question: q } },
      );
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Ask failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const sources = result?.sources ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          placeholder="e.g. How do habits actually form?"
          className="w-full flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={ask}
          disabled={loading || !question.trim()}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {result && !loading && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-900 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Answer
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {result.retrieval === "vector" ? "Semantic search" : "Keyword match"}
              </span>
            </div>
            <p className="whitespace-pre-line leading-relaxed text-zinc-800 dark:text-zinc-100">
              {result.answer}
            </p>
          </div>

          {(sources.length > 0 || (demoHits?.length ?? 0) > 0) && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Sources
              </h2>
              <div className="flex flex-col gap-3">
                {(sources.length > 0 ? sources : demoHits ?? []).map(
                  (s, i) => (
                    <div
                      key={`${s.slug}-${i}`}
                      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {s.title}
                        </p>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {s.category_name ?? "General"}
                        </span>
                      </div>
                      {"chunk_text" in s && (
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          &ldquo;{s.chunk_text}&rdquo;
                        </p>
                      )}
                      <Link
                        href={`/artifact/${s.slug}`}
                        className="mt-2 inline-block text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
                      >
                        Open artifact →
                      </Link>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
