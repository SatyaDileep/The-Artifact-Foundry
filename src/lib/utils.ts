import type { Content } from "./types";

/** Turn any string into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Comma-separated ADMIN_EMAILS from server env. */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Whether a user email is allowed to manage the library.
 * In demo mode we never block (there is no real database to protect).
 */
export function isAdminAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

/** Rough token estimate used for indexing metadata. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.round(text.length / 4));
}

/**
 * Split a long transcript into overlapping windows so each chunk stays
 * well under embedding-model token limits.
 */
export function splitTranscript(
  transcript: string,
  windowChars = 1200,
  overlapChars = 150,
): string[] {
  const clean = transcript.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= windowChars) return [clean];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    let end = start + windowChars;
    if (end < clean.length) {
      // Prefer to break on a sentence boundary near the end of the window.
      const boundary = clean.lastIndexOf(". ", end);
      if (boundary > start + windowChars / 2) end = boundary + 1;
    }
    chunks.push(clean.slice(start, end).trim());
    start = Math.max(end - overlapChars, start + 1);
  }
  return chunks;
}

export interface ContentChunk {
  index: number;
  text: string;
  tokens: number;
}

/**
 * Build the searchable chunk list for an artifact: title context, quotes,
 * flashcards, top moments, and the raw transcript. Kept deterministic so
 * re-indexing is idempotent per (content_id, chunk_index).
 */
export function buildContentChunks(content: Content): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  const push = (text: string) => {
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (trimmed) chunks.push({ index: chunks.length, text: trimmed, tokens: estimateTokens(trimmed) });
  };

  const category = content.category?.name ?? "General";
  const tags = content.tags?.length ? content.tags.map((t) => `#${t}`).join(" ") : "";
  push(`Title: ${content.title}. Category: ${category}.${tags ? ` Tags: ${tags}.` : ""}`);

  for (const quote of content.quotes ?? []) {
    push(`Quote${quote.timestamp ? ` (${quote.timestamp})` : ""}: "${quote.text}"`);
  }
  for (const card of content.flashcards ?? []) {
    push(`Flashcard — Q: ${card.front} A: ${card.back}`);
  }
  for (const moment of content.top_moments ?? []) {
    push(`Key moment${moment.timestamp_ref ? ` (${moment.timestamp_ref})` : ""}: ${moment.title} — ${moment.summary}`);
  }
  for (const transcriptChunk of splitTranscript(content.transcript ?? "")) {
    push(`Transcript excerpt: ${transcriptChunk}`);
  }

  return chunks;
}
