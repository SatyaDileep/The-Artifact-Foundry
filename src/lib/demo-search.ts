import { demoContent } from "./demo-data";

export interface DemoHit {
  slug: string;
  title: string;
  category_name: string;
  snippet: string;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with",
  "is", "are", "how", "what", "why", "do", "does", "should", "me", "my",
  "about", "from", "can", "you", "your", "it", "that", "this", "i", "at",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function score(text: string, terms: string[]): number {
  const words = tokenize(text);
  return words.filter((w) => terms.includes(w)).length;
}

/** Demo-mode retrieval: simple term-overlap scoring over the demo corpus. */
export function demoSearch(
  question: string,
  content = demoContent,
): { answer: string; hits: DemoHit[] } {
  const terms = tokenize(question);
  const hits: DemoHit[] = [];

  for (const artifact of content.filter((c) => c.is_published)) {
    const pieces: { text: string; score: number }[] = [];
    for (const q of artifact.quotes ?? []) {
      const s = score(q.text, terms);
      if (s > 0) pieces.push({ text: q.text, score: s });
    }
    for (const m of artifact.top_moments ?? []) {
      const s = score(`${m.title} ${m.summary}`, terms);
      if (s > 0) pieces.push({ text: `${m.title} — ${m.summary}`, score: s });
    }
    if (pieces.length > 0) {
      pieces.sort((a, b) => b.score - a.score);
      hits.push({
        slug: artifact.slug,
        title: artifact.title,
        category_name: artifact.category?.name ?? "General",
        snippet: pieces[0].text,
      });
    }
  }

  if (hits.length === 0) {
    return {
      answer:
        "Nothing in the demo library matched that yet. Try asking about habits, money, product management, or system design.",
      hits: [],
    };
  }

  const top = hits.slice(0, 4);
  const answer =
    `Here are the closest insights in the demo library (${hits.length} artifact${hits.length > 1 ? "s" : ""} matched):\n\n` +
    top.map((h, i) => `[${i + 1}] ${h.snippet}`).join("\n\n");

  return { answer, hits: top };
}
