import type { Metadata } from "next";
import Link from "next/link";
import AskWidget from "@/components/AskWidget";

export const metadata: Metadata = {
  title: "Ask the Library",
  description:
    "Ask a question and get a grounded answer from quotes, key moments, and transcripts distilled from the library.",
};

export default function AskPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-8 text-center">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          Ask the Library
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Ask the library anything
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
          Every answer is grounded in the curated quotes, key moments, and
          transcripts of this library — with links back to the original
          artifacts.
        </p>
      </div>

      <AskWidget />

      <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          Example questions
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>How do habits actually form?</li>
          <li>What separates rich thinking from poor thinking?</li>
          <li>How should product managers prioritize?</li>
          <li>What is leverage and why does it matter?</li>
        </ul>
        <p className="mt-3">
          Prefer browsing? Explore the{" "}
          <Link href="/" className="font-medium text-amber-600 underline-offset-2 hover:underline dark:text-amber-400">
            full library
          </Link>{" "}
          or follow a{" "}
          <Link href="/#paths" className="font-medium text-amber-600 underline-offset-2 hover:underline dark:text-amber-400">
            career path
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
