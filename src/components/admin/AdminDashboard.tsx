"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCategories, getAllContent, getRoles } from "@/lib/queries";
import { isDemoMode, demoContent } from "@/lib/demo-data";
import { slugify } from "@/lib/utils";
import type { Category, Content, Role } from "@/lib/types";

interface IndexResult {
  indexed?: number;
  chunks?: number;
  note?: string;
  failures?: { slug: string; errors: string[] }[];
  error?: string;
}

interface DraftQuote {
  id: string;
  text: string;
  timestamp: string;
}
interface DraftFlashcard {
  id: string;
  front: string;
  back: string;
}
interface DraftMoment {
  id: string;
  title: string;
  summary: string;
  timestamp_ref: string;
}

const uid = () => Math.random().toString(36).slice(2);

export default function AdminDashboard({ userEmail }: { userEmail: string }) {
  const [tab, setTab] = useState<"create" | "manage" | "import">("create");

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Curator Dashboard</h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{userEmail}</span>
      </div>

      <div className="mb-6 flex gap-2">
        <TabButton active={tab === "create"} onClick={() => setTab("create")}>
          Create
        </TabButton>
        <TabButton active={tab === "import"} onClick={() => setTab("import")}>
          Import
        </TabButton>
        <TabButton active={tab === "manage"} onClick={() => setTab("manage")}>
          Manage
        </TabButton>
      </div>

      {tab === "create" ? (
        <CreateTab />
      ) : tab === "import" ? (
        <ImportTab />
      ) : (
        <ManageTab />
      )}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

function CreateTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState("");
  const [transcript, setTranscript] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [roleSlugs, setRoleSlugs] = useState<string[]>([]);
  const [platform, setPlatform] = useState("YouTube");

  const [quotes, setQuotes] = useState<DraftQuote[]>([]);
  const [flashcards, setFlashcards] = useState<DraftFlashcard[]>([]);
  const [moments, setMoments] = useState<DraftMoment[]>([]);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getCategories(createClient()).then(setCategories).catch(console.error);
    getRoles(createClient()).then(setRoles).catch(console.error);
  }, []);

  const generate = async () => {
    setError(null);
    if (!transcript && !sourceUrl) {
      setError("Provide a source URL or paste a transcript to generate.");
      return;
    }
    if (!categoryId) {
      setError("Select a category to guide the AI.");
      return;
    }
    setGenerating(true);
    try {
      if (isDemoMode) {
        const sample = demoContent[0];
        setQuotes(
          sample.quotes.map((q) => ({
            id: uid(),
            text: q.text,
            timestamp: q.timestamp ?? "",
          })),
        );
        setFlashcards(
          sample.flashcards.map((f) => ({
            id: uid(),
            front: f.front,
            back: f.back,
          })),
        );
        setMoments(
          sample.top_moments.map((m) => ({
            id: uid(),
            title: m.title,
            summary: m.summary,
            timestamp_ref: m.timestamp_ref ?? "",
          })),
        );
        setRoleSlugs(sample.role_slugs ?? []);
        setTags((sample.tags ?? []).join(", "));
        setNotice("Demo: AI generated draft. Review and edit below, then publish.");
        return;
      }

      const client = createClient();
      const category = categories.find((c) => c.id === categoryId)?.name ?? "";
      const { data, error: fnError } = await client.functions.invoke(
        "generate-artifact",
        { body: { transcript, sourceUrl, category } },
      );
      if (fnError) throw fnError;
      const result = data as {
        quotes?: { text: string; timestamp?: string }[];
        flashcards?: { front: string; back: string }[];
        top_moments?: { title: string; summary: string; timestamp_ref?: string }[];
        tags?: string[];
      };
      setQuotes(
        (result.quotes ?? []).map((q) => ({
          id: uid(),
          text: q.text,
          timestamp: q.timestamp ?? "",
        })),
      );
      setFlashcards(
        (result.flashcards ?? []).map((f) => ({
          id: uid(),
          front: f.front,
          back: f.back,
        })),
      );
      setMoments(
        (result.top_moments ?? []).map((m) => ({
          id: uid(),
          title: m.title,
          summary: m.summary,
          timestamp_ref: m.timestamp_ref ?? "",
        })),
      );
      if (result.tags?.length) setTags(result.tags.join(", "));
      setNotice("AI generated draft. Review and edit below, then publish.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const save = async (publish: boolean) => {
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const finalSlug = slug.trim() ? slug : slugify(title);
    if (!finalSlug) {
      setError("Could not create a slug from the title.");
      return;
    }

    if (isDemoMode) {
      setNotice(
        publish
          ? "Demo mode: published to the live feed (not saved to a database)."
          : "Demo mode: saved as draft (not saved to a database).",
      );
      resetForm();
      return;
    }

    setSaving(true);
    try {
      const client = createClient();
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { data: row, error: contentError } = await client
        .from("content")
        .upsert(
          {
            slug: finalSlug,
            title: title.trim(),
            source_url: sourceUrl.trim() || null,
            cover_image_url: coverUrl.trim() || null,
            transcript: transcript.trim() || null,
            platform: platform || null,
            category_id: categoryId || null,
            tags: tagList.length ? tagList : null,
            role_slugs: roleSlugs.length ? roleSlugs : null,
            is_published: publish,
          },
          { onConflict: "slug" },
        )
        .select("id")
        .single();

      if (contentError) throw contentError;
      const contentId = row.id;

      // Keep the semantic search index fresh for anything we just saved.
      if (publish) {
        try {
          await client.functions.invoke("index-artifacts", {
            body: { contentId },
          });
        } catch (e) {
          console.error("Reindex after publish failed:", e);
        }
      }

      const quoteInserts = quotes
        .filter((q) => q.text.trim())
        .map((q) => ({
          content_id: contentId,
          text: q.text.trim(),
          timestamp: q.timestamp.trim() || null,
        }));
      const cardInserts = flashcards
        .filter((f) => f.front.trim() && f.back.trim())
        .map((f) => ({
          content_id: contentId,
          front: f.front.trim(),
          back: f.back.trim(),
        }));
      const momentInserts = moments
        .filter((m) => m.title.trim() && m.summary.trim())
        .map((m) => ({
          content_id: contentId,
          title: m.title.trim(),
          summary: m.summary.trim(),
          timestamp_ref: m.timestamp_ref.trim() || null,
        }));

      if (quoteInserts.length)
        await client.from("quotes").insert(quoteInserts);
      if (cardInserts.length)
        await client.from("flashcards").insert(cardInserts);
      if (momentInserts.length)
        await client.from("top_moments").insert(momentInserts);

      setNotice(publish ? "Published to the live feed." : "Saved as draft.");
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setSourceUrl("");
    setCoverUrl("");
    setTags("");
    setTranscript("");
    setCategoryId("");
    setRoleSlugs([]);
    setQuotes([]);
    setFlashcards([]);
    setMoments([]);
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {notice}
        </p>
      )}

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">1. Source</h2>
        <Field label="Title" required>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (!slug.trim() && title.trim()) setSlug(slugify(title));
            }}
            placeholder="e.g. How to Build Habits"
          />
        </Field>
        <Field label="Slug (URL — auto-fills from title)">
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="how-to-build-habits"
          />
        </Field>
        <Field label="Source URL">
          <input
            className={inputClass}
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Platform">
            <select
              className={inputClass}
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {["YouTube", "Spotify", "Article", "Podcast", "Web"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {roles.length > 0 && (
          <Field label="Career Paths (select all that apply)">
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => {
                const active = roleSlugs.includes(r.slug);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() =>
                      setRoleSlugs((list) =>
                        active
                          ? list.filter((s) => s !== r.slug)
                          : [...list, r.slug],
                      )
                    }
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                    }`}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
        <Field label="Cover Image URL">
          <input
            className={inputClass}
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
          />
        </Field>
        <Field label="Tags (comma separated)">
          <input
            className={inputClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Productivity, Focus, Habits"
          />
        </Field>
      </div>

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">2. Transcript & AI Generation</h2>
        <Field label="Raw transcript / text">
          <textarea
            className={`${inputClass} min-h-40`}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste the transcript here, or provide a YouTube URL above and leave this empty to auto-fetch."
          />
        </Field>
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 font-semibold text-white shadow transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {generating ? "Generating…" : "✨ Generate with AI"}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">3. Quotes</h2>
            <AddButton onClick={() => setQuotes((q) => [...q, { id: uid(), text: "", timestamp: "" }])} />
          </div>
          {quotes.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No quotes yet. Generate or add manually.
            </p>
          )}
          {quotes.map((q, i) => (
            <ItemRow
              key={q.id}
              onRemove={() => setQuotes((list) => list.filter((x) => x.id !== q.id))}
            >
              <textarea
                className={`${inputClass} min-h-16`}
                value={q.text}
                onChange={(e) =>
                  setQuotes((list) =>
                    list.map((x) => (x.id === q.id ? { ...x, text: e.target.value } : x)),
                  )
                }
                placeholder={`Quote ${i + 1}`}
              />
              <input
                className={`${inputClass} mt-2 w-32`}
                value={q.timestamp}
                onChange={(e) =>
                  setQuotes((list) =>
                    list.map((x) => (x.id === q.id ? { ...x, timestamp: e.target.value } : x)),
                  )
                }
                placeholder="00:00"
              />
            </ItemRow>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">4. Flashcards</h2>
            <AddButton onClick={() => setFlashcards((f) => [...f, { id: uid(), front: "", back: "" }])} />
          </div>
          {flashcards.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No flashcards yet.
            </p>
          )}
          {flashcards.map((f) => (
            <ItemRow key={f.id} onRemove={() => setFlashcards((list) => list.filter((x) => x.id !== f.id))}>
              <input
                className={inputClass}
                value={f.front}
                onChange={(e) =>
                  setFlashcards((list) =>
                    list.map((x) => (x.id === f.id ? { ...x, front: e.target.value } : x)),
                  )
                }
                placeholder="Question / concept"
              />
              <textarea
                className={`${inputClass} mt-2 min-h-16`}
                value={f.back}
                onChange={(e) =>
                  setFlashcards((list) =>
                    list.map((x) => (x.id === f.id ? { ...x, back: e.target.value } : x)),
                  )
                }
                placeholder="Answer / explanation"
              />
            </ItemRow>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">5. Top Moments</h2>
            <AddButton onClick={() => setMoments((m) => [...m, { id: uid(), title: "", summary: "", timestamp_ref: "" }])} />
          </div>
          {moments.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No top moments yet.
            </p>
          )}
          {moments.map((m) => (
            <ItemRow key={m.id} onRemove={() => setMoments((list) => list.filter((x) => x.id !== m.id))}>
              <input
                className={inputClass}
                value={m.title}
                onChange={(e) =>
                  setMoments((list) =>
                    list.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x)),
                  )
                }
                placeholder="Moment title"
              />
              <textarea
                className={`${inputClass} mt-2 min-h-16`}
                value={m.summary}
                onChange={(e) =>
                  setMoments((list) =>
                    list.map((x) => (x.id === m.id ? { ...x, summary: e.target.value } : x)),
                  )
                }
                placeholder="2-3 sentence summary"
              />
              <input
                className={`${inputClass} mt-2 w-32`}
                value={m.timestamp_ref}
                onChange={(e) =>
                  setMoments((list) =>
                    list.map((x) => (x.id === m.id ? { ...x, timestamp_ref: e.target.value } : x)),
                  )
                }
                placeholder="14:20"
              />
            </ItemRow>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={saving}
          className="rounded-xl border border-zinc-300 px-6 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {saving ? "Saving…" : "Save as Draft"}
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-white shadow transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Publish"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-zinc-300 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      + Add
    </button>
  );
}

function ItemRow({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
        >
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

const importExample = `{
  "slug": "digital-minimalism",
  "title": "Digital Minimalism — Reclaiming Your Attention",
  "source_url": "https://www.youtube.com/watch?v=abcdef",
  "platform": "YouTube",
  "category": "productivity",
  "tags": ["Attention", "Focus", "Technology"],
  "roles": ["software-architect"],
  "is_published": true,
  "transcript": "Paste the full transcript here so it can be indexed for Ask the Library.",
  "quotes": [
    { "text": "You don't get to choose what you don't notice.", "timestamp": "03:10" },
    { "text": "Solitude is the factory of creative thought.", "timestamp": "11:40" }
  ],
  "flashcards": [
    { "front": "What is digital minimalism?", "back": "A philosophy of technology use where you keep only a small number of high-value tools." }
  ],
  "top_moments": [
    { "title": "Attention is the bottleneck", "summary": "Every notification taxes attention; curating your tools is a decision you must own.", "timestamp_ref": "03:10" }
  ]
}`;

function ImportTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [json, setJson] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    getCategories(createClient()).then(setCategories).catch(console.error);
    getRoles(createClient()).then(setRoles).catch(console.error);
  }, []);

  const doImport = async () => {
    setError(null);
    setResult(null);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      setError(`Invalid JSON: ${e instanceof Error ? e.message : "parse failed"}`);
      return;
    }

    const slug = String(parsed.slug ?? "");
    const title = String(parsed.title ?? "");
    if (!slug || !title) {
      setError("Both \"slug\" and \"title\" are required.");
      return;
    }

    if (isDemoMode) {
      setResult(`Demo mode: would import \"${title}\" (slug: ${slug}). No database connected.`);
      setJson("");
      return;
    }

    setBusy(true);
    try {
      const client = createClient();

      let categoryId: string | null = null;
      const categorySlug = String(parsed.category ?? "");
      if (categorySlug) {
        const cat = categories.find((c) => c.slug === categorySlug);
        if (!cat) {
          setError(`Unknown category slug: \"${categorySlug}\".`);
          setBusy(false);
          return;
        }
        categoryId = cat.id;
      }

      const roleSlugs = (Array.isArray(parsed.roles) ? parsed.roles : [])
        .map(String)
        .filter(Boolean);
      for (const rs of roleSlugs) {
        if (!roles.find((r) => r.slug === rs)) {
          setError(`Unknown role slug: \"${rs}\".`);
          setBusy(false);
          return;
        }
      }

      const tags = (Array.isArray(parsed.tags) ? parsed.tags : []).map(String);
      const cover = parsed.cover_image_url ? String(parsed.cover_image_url) : null;
      const platform = parsed.platform ? String(parsed.platform) : null;
      const isPublished = parsed.is_published === true;

      const {
        data: row,
        error: contentError,
      } = await client
        .from("content")
        .upsert(
          {
            slug,
            title,
            source_url: parsed.source_url ? String(parsed.source_url) : null,
            platform,
            category_id: categoryId,
            cover_image_url: cover,
            transcript: parsed.transcript ? String(parsed.transcript) : null,
            tags: tags.length ? tags : null,
            role_slugs: roleSlugs.length ? roleSlugs : null,
            is_published: isPublished,
          },
          { onConflict: "slug" },
        )
        .select("id")
        .single();
      if (contentError) throw contentError;
      const contentId = row.id;

      const quoteInserts = (
        (Array.isArray(parsed.quotes) ? parsed.quotes : []) as {
          text?: unknown;
          timestamp?: unknown;
        }[]
      )
        .map((q) => ({
          text: typeof q.text === "string" ? q.text.trim() : "",
          timestamp:
            typeof q.timestamp === "string" && q.timestamp.trim()
              ? q.timestamp.trim()
              : "",
        }))
        .filter((q) => q.text)
        .map((q) => ({
          content_id: contentId,
          text: q.text,
          timestamp: q.timestamp || null,
        }));

      const cardInserts = (
        (Array.isArray(parsed.flashcards) ? parsed.flashcards : []) as {
          front?: unknown;
          back?: unknown;
        }[]
      )
        .map((f) => ({
          front: typeof f.front === "string" ? f.front.trim() : "",
          back: typeof f.back === "string" ? f.back.trim() : "",
        }))
        .filter((f) => f.front && f.back)
        .map((f) => ({
          content_id: contentId,
          front: f.front,
          back: f.back,
        }));

      const momentInserts = (
        (Array.isArray(parsed.top_moments) ? parsed.top_moments : []) as {
          title?: unknown;
          summary?: unknown;
          timestamp_ref?: unknown;
        }[]
      )
        .map((m) => ({
          title: typeof m.title === "string" ? m.title.trim() : "",
          summary: typeof m.summary === "string" ? m.summary.trim() : "",
          timestamp_ref:
            typeof m.timestamp_ref === "string" && m.timestamp_ref.trim()
              ? m.timestamp_ref.trim()
              : "",
        }))
        .filter((m) => m.title && m.summary)
        .map((m) => ({
          content_id: contentId,
          title: m.title,
          summary: m.summary,
          timestamp_ref: m.timestamp_ref || null,
        }));

      await client.from("quotes").delete().eq("content_id", contentId);
      await client.from("flashcards").delete().eq("content_id", contentId);
      await client.from("top_moments").delete().eq("content_id", contentId);

      if (quoteInserts.length) {
        const r = await client.from("quotes").insert(quoteInserts);
        if (r.error) throw r.error;
      }
      if (cardInserts.length) {
        const r = await client.from("flashcards").insert(cardInserts);
        if (r.error) throw r.error;
      }
      if (momentInserts.length) {
        const r = await client.from("top_moments").insert(momentInserts);
        if (r.error) throw r.error;
      }

      setResult(
        `Imported \"${title}\" — ${quoteInserts.length} quotes, ${cardInserts.length} flashcards, ${momentInserts.length} moments. Reflected on ${roleSlugs.length ? roleSlugs.join(", ") : "the main feed"}.`,
      );
      setJson("");

      // Index the new artifact for semantic search (best-effort).
      try {
        await client.functions.invoke("index-artifacts", {
          body: { contentId },
        });
      } catch (e) {
        console.error("Reindex after import failed:", e);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {result && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {result}
        </p>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Paste artifact JSON</h2>
          <button
            type="button"
            onClick={() => setJson(importExample)}
            className="rounded-md border border-zinc-300 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Load example
          </button>
        </div>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          Paste one artifact (quotes, flashcards, top moments, category, and role
          paths) generated offline. Importing by slug is idempotent — re-importing
          updates the artifact and replaces its children.
        </p>
        <textarea
          className={`${inputClass} min-h-80 font-mono text-xs`}
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder={importExample}
        />
        <div className="mt-4">
          <button
            type="button"
            onClick={doImport}
            disabled={busy}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-white shadow transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? "Importing…" : "Import artifact"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          JSON fields
        </h3>
        <pre className="overflow-x-auto text-xs text-zinc-600 dark:text-zinc-300">
{`{
  "slug": "unique-url-slug",            // required, unique
  "title": "Artifact title",            // required
  "source_url": "https://...",
  "platform": "YouTube | Spotify | Podcast | Article | Web",
  "category": "category-slug",          // e.g. "productivity"
  "tags": ["Focus", "Technology"],
  "roles": ["role-slug"],               // e.g. ["product-manager"]
  "is_published": true,
  "cover_image_url": null,
  "transcript": "full transcript (used by Ask the Library / RAG)",
  "quotes": [ { "text": "...", "timestamp": "02:10" } ],
  "flashcards": [ { "front": "...", "back": "..." } ],
  "top_moments": [ { "title": "...", "summary": "...", "timestamp_ref": "14:20" } ]
}`}
        </pre>
      </div>
    </div>
  );
}

function ManageTab() {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [indexNotice, setIndexNotice] = useState<string | null>(null);

  const reindex = async () => {
    if (isDemoMode) {
      setIndexNotice("Demo mode: no database to index.");
      return;
    }
    setIndexing(true);
    setIndexNotice(null);
    try {
      const { data } = await createClient().functions.invoke<IndexResult>(
        "index-artifacts",
        { body: {} },
      );
      if (data?.error) throw new Error(data.error);
      setIndexNotice(
        data?.note ??
          `Indexed ${data?.indexed ?? 0} artifacts (${data?.chunks ?? 0} chunks).`,
      );
    } catch (e) {
      setIndexNotice(
        `Indexing failed: ${e instanceof Error ? e.message : "unknown error"}. Make sure the index-artifacts function is deployed.`,
      );
    } finally {
      setIndexing(false);
    }
  };

  const load = useCallback(async () => {
    const data = await getAllContent(createClient());
    setItems(data);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getAllContent(createClient());
        if (active) setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const togglePublish = async (item: Content) => {
    setAction(item.id);
    if (isDemoMode) {
      setItems((list) =>
        list.map((i) =>
          i.id === item.id ? { ...i, is_published: !i.is_published } : i,
        ),
      );
      setAction(null);
      return;
    }
    await createClient()
      .from("content")
      .update({ is_published: !item.is_published })
      .eq("id", item.id);
    await load();
    setAction(null);
  };

  const remove = async (item: Content) => {
    if (!confirm(`Delete "${item.title}"? This removes its quotes, flashcards, and moments.`)) return;
    setAction(item.id);
    if (isDemoMode) {
      setItems((list) => list.filter((i) => i.id !== item.id));
      setAction(null);
      return;
    }
    await createClient().from("content").delete().eq("id", item.id);
    await load();
    setAction(null);
  };

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  if (items.length === 0)
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700">
        No content yet. Create your first artifact.
      </p>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Rebuild the semantic search index after large imports or transcript
          edits.
        </p>
        <button
          type="button"
          onClick={reindex}
          disabled={indexing}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {indexing ? "Indexing…" : "Reindex search"}
        </button>
      </div>
      {indexNotice && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {indexNotice}
        </p>
      )}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((item) => (
            <tr key={item.id} className="bg-white dark:bg-zinc-900">
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                {item.title}
              </td>
              <td className="px-4 py-3">
                {item.is_published ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    Published
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                    Draft
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={action === item.id}
                    onClick={() => togglePublish(item)}
                    className="rounded-md px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-950"
                  >
                    {item.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    disabled={action === item.id}
                    onClick={() => remove(item)}
                    className="rounded-md px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
