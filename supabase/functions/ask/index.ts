/// <reference path="../_shared/supabase-ai.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MAX_QUESTION_LENGTH = 500

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

interface Source {
  chunk_id: string
  content_id: string
  chunk_text: string
  slug: string
  title: string
  category_name: string | null
  similarity: number
}

async function retrieve(
  supabase: SupabaseClient,
  question: string,
): Promise<{ sources: Source[]; retrieval: 'vector' | 'keyword' }> {
  // 1) Semantic (vector) retrieval using the built-in embedding model.
  try {
    const queryEmbedding = await embed(question)
    const { data, error } = await supabase.rpc('search_artifacts', {
      query_embedding: queryEmbedding,
      match_count: 6,
    })
    if (!error && Array.isArray(data) && data.length > 0) {
      return {
        retrieval: 'vector',
        sources: data as unknown as Source[],
      }
    }
    console.error('Vector search returned no rows or errored:', error?.message)
  } catch (e) {
    console.error('Vector retrieval failed, falling back to keyword:', e)
  }

  // 2) Keyword fallback (works even if chunks aren't embedded yet).
  const { data, error } = await supabase.rpc('search_artifacts_keyword', {
    q: question,
    match_count: 6,
  })
  if (error) throw new Error(`Keyword search failed: ${error.message}`)
  return {
    retrieval: 'keyword',
    sources: (data ?? []) as unknown as Source[],
  }
}

async function answer(question: string, sources: Source[]): Promise<string> {
  const groqKey = Deno.env.get('GROQ_API_KEY')
  if (!groqKey) {
    throw new Error('GROQ_API_KEY is not configured on this Supabase project.')
  }

  const context = sources
    .map((s, i) => `[${i + 1}] ${s.title}${s.category_name ? ` (${s.category_name})` : ''}\n${s.chunk_text}`)
    .join('\n\n')

  const systemPrompt =
    'You are the curator of a library of learning artifacts distilled from videos, podcasts, articles, and books. ' +
    'Answer the visitor\'s question using ONLY the retrieved excerpts below. Be concise, practical, and honest. ' +
    'After every claim that comes from a specific excerpt, add a citation like [1] or [2] matching the excerpt number. ' +
    'If the excerpts do not contain enough to answer, say so clearly and suggest what the visitor could search for instead. ' +
    'Never invent facts outside the excerpts.'

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('GROQ_MODEL') ?? 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Question: ${question}\n\nRetrieved excerpts:\n${context}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 900,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Groq API error: ${detail.slice(0, 300)}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  return raw
    .replace(/^```(?:json|text)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const question = String(body?.question ?? '').trim().slice(0, MAX_QUESTION_LENGTH)
    if (!question) {
      return json({ error: 'Ask a question about the library.' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    const { sources, retrieval } = await retrieve(supabase, question)

    if (sources.length === 0) {
      return json({
        answer:
          'I could not find anything relevant in the library yet. Try a different question — for example about habits, money, product management, or systems design.',
        sources: [],
        retrieval,
      })
    }

    const answerText = await answer(question, sources)

    return json({
      answer: answerText,
      sources: sources.map((s) => ({
        slug: s.slug,
        title: s.title,
        category_name: s.category_name,
        chunk_text: s.chunk_text.length > 240 ? `${s.chunk_text.slice(0, 240)}…` : s.chunk_text,
      })),
      retrieval,
    })
  } catch (error) {
    console.error('ask failed:', error)
    return json({ error: error instanceof Error ? error.message : 'Ask failed.' }, 500)
  }
})

