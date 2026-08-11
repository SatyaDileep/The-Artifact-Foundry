/// <reference path="../_shared/supabase-ai.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Free built-in embedding model (gte-small, 384 dims) — no external key needed.
let embedSession: Supabase.ai.Session | null = null

async function embed(text: string): Promise<string> {
  embedSession ??= new Supabase.ai.Session('gte-small')
  const output = await embedSession.run(text, { mean_pool: true, normalize: true })
  return JSON.stringify(Array.from(output as Float32Array))
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.round(text.length / 4))
}

function splitTranscript(transcript: string, windowChars = 1200, overlapChars = 150): string[] {
  const clean = transcript.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  if (clean.length <= windowChars) return [clean]

  const chunks: string[] = []
  let start = 0
  while (start < clean.length) {
    let end = start + windowChars
    if (end < clean.length) {
      const boundary = clean.lastIndexOf('. ', end)
      if (boundary > start + windowChars / 2) end = boundary + 1
    }
    chunks.push(clean.slice(start, end).trim())
    start = Math.max(end - overlapChars, start + 1)
  }
  return chunks
}

interface ContentRow {
  id: string
  slug: string
  title: string
  transcript?: string | null
  tags?: string[] | null
  category?: { name: string } | null
  quotes: { text: string; timestamp?: string | null }[]
  flashcards: { front: string; back: string }[]
  top_moments: { title: string; summary: string; timestamp_ref?: string | null }[]
}

function buildChunks(content: ContentRow): { index: number; text: string; tokens: number }[] {
  const chunks: { index: number; text: string; tokens: number }[] = []
  const push = (text: string) => {
    const trimmed = text.replace(/\s+/g, ' ').trim()
    if (trimmed) chunks.push({ index: chunks.length, text: trimmed, tokens: estimateTokens(trimmed) })
  }

  const category = content.category?.name ?? 'General'
  const tags = content.tags?.length ? content.tags.map((t) => `#${t}`).join(' ') : ''
  push(`Title: ${content.title}. Category: ${category}.${tags ? ` Tags: ${tags}.` : ''}`)

  for (const quote of content.quotes ?? []) {
    push(`Quote${quote.timestamp ? ` (${quote.timestamp})` : ''}: "${quote.text}"`)
  }
  for (const card of content.flashcards ?? []) {
    push(`Flashcard — Q: ${card.front} A: ${card.back}`)
  }
  for (const moment of content.top_moments ?? []) {
    push(`Key moment${moment.timestamp_ref ? ` (${moment.timestamp_ref})` : ''}: ${moment.title} — ${moment.summary}`)
  }
  for (const transcriptChunk of splitTranscript(content.transcript ?? '')) {
    push(`Transcript excerpt: ${transcriptChunk}`)
  }

  return chunks
}

async function requireAdmin(supabase: SupabaseClient, req: Request) {
  const authHeader = req.headers.get('Authorization')
  const jwt = authHeader?.replace('Bearer ', '')
  if (!jwt) return { error: json({ error: 'Unauthorized' }, 401) }

  const { data: { user } } = await supabase.auth.getUser(jwt)
  if (!user?.email) return { error: json({ error: 'Unauthorized' }, 401) }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle()
  if (!admin) return { error: json({ error: 'Forbidden: not a curator' }, 403) }

  return { error: null }
}

async function indexContent(
  supabase: SupabaseClient,
  content: ContentRow,
): Promise<{ chunks: number; errors: string[] }> {
  const chunks = buildChunks(content)
  const errors: string[] = []
  let embedded = 0

  for (const chunk of chunks) {
    try {
      const embedding = await embed(chunk.text)
      const { error } = await supabase.from('artifact_chunks').upsert(
        {
          content_id: content.id,
          chunk_index: chunk.index,
          text: chunk.text,
          token_count: chunk.tokens,
          embedding,
        },
        { onConflict: 'content_id,chunk_index' },
      )
      if (error) errors.push(`chunk ${chunk.index}: ${error.message}`)
      else embedded++
    } catch (e) {
      errors.push(`chunk ${chunk.index}: ${e instanceof Error ? e.message : 'unknown'}`)
    }
  }

  return { chunks: embedded, errors }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    const guard = await requireAdmin(supabase, req)
    if (guard.error) return guard.error

    let body: { contentId?: string } = {}
    try {
      body = await req.json()
    } catch {
      // no body is fine — index everything
    }

    const query = supabase
      .from('content')
      .select('*, category:categories(name), quotes(*), flashcards(*), top_moments(*)')

    if (body.contentId) {
      query.eq('id', body.contentId)
    }

    const { data, error } = await query
    if (error) return json({ error: error.message }, 500)

    const rows = (data ?? []) as unknown as ContentRow[]
    let contentIndexed = 0
    let totalChunks = 0
    const failures: { slug: string; errors: string[] }[] = []

    for (const row of rows) {
      const result = await indexContent(supabase, row)
      if (result.errors.length) failures.push({ slug: row.slug, errors: result.errors })
      if (result.chunks > 0) contentIndexed++
      totalChunks += result.chunks
    }

    return json({
      indexed: contentIndexed,
      chunks: totalChunks,
      failures,
      note: failures.length
        ? 'Some chunks failed to embed. Confirm the index-artifacts function is deployed and has access to Supabase.ai, then re-run.'
        : 'Library is ready for semantic search.',
    })
  } catch (error) {
    console.error('index-artifacts failed:', error)
    return json({ error: error instanceof Error ? error.message : 'Indexing failed.' }, 500)
  }
})
