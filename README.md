# Artifact Foundry

**Content is abundant. Taste is not.**

Artifact Foundry is an open-source, AI-powered learning-artifact platform. It turns long-form content — videos, podcasts, articles, and books — into concise, reusable knowledge: memorable **quotes**, **top moments**, **flashcards**, and **tags**. A curator adds source content and its transcript; AI distills the artifacts; the curator reviews and publishes; visitors discover them through career paths, categories, and a RAG-powered "Ask the Library".

Built for a simple belief: instead of chasing trending content, follow what working professionals actually cite.

## Why it exists

- **Visitors** drown in content but starve for signal. Artifact Foundry gives them curated career paths with links to launch, learn, and embrace — the people, books, newsletters, and podcasts working professionals actually follow.
- **Curators** get a fast, AI-assisted pipeline: paste a YouTube URL or transcript → AI extracts quotes, flashcards, key moments, and tags → review and publish in minutes.
- **Everyone** gets an honest search: *Ask the Library* answers questions grounded only in the curated corpus, with citations back to the original artifacts.

## Features

**Visitor surface**
- Home feed with categories, career paths, and an **Inspire Me** random-quote generator
- Role path pages — curated sources for Product Managers, Engineers & Architects, Data Scientists, and Designers, each with launch links
- Artifact detail pages — quotes, flipable flashcards, top moments, tags, and a link to the source
- **Ask the Library** — semantic Q&A over the whole corpus with cited sources (pgvector + Groq)

**Curator surface** (`/admin`, Google OAuth, admin allowlist)
- **Create** — source metadata + transcript, AI generation, review/edit, save draft or publish
- **Import** — idempotent JSON import (bulk loading artifacts offline)
- **Manage** — publish/unpublish, delete, and re-index the semantic search

**Platform**
- Supabase (Auth + Postgres + Edge Functions), RLS enforced, admin-only writes
- SEO: server-rendered pages, sitemap, robots, JSON-LD structured data
- Demo mode: run the full experience without a database

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Turbopack) |
| UI | React 19, Tailwind CSS v4, Lora display font |
| Data fetching | Server Components + TanStack Query (client) |
| Backend | Supabase — Postgres, Auth (Google OAuth), Edge Functions (Deno) |
| AI | Groq (LLM) for generation + answers; Supabase built-in `gte-small` embeddings (free) |
| Search | pgvector (HNSW) semantic search with keyword fallback |
| Embeddings | Supabase `Supabase.ai` built-in `gte-small` — no external key |
| Deploy | Vercel (app) + Supabase (data & functions) |

## Architecture

```
┌────────────────────────────┐        ┌─────────────────────────────┐
│  Next.js (Vercel)          │        │  Supabase                  │
│                            │        │                             │
│  Public: /, /ask,          │  REST  │  Postgres                  │
│  /artifact/[slug],         │ ─────▶ │   content + transcript     │
│  /role/[slug]              │        │   quotes / flashcards /    │
│  Admin: /admin             │        │   top_moments              │
│  Auth via @supabase/ssr    │        │   artifact_chunks (vector) │
│                            │        │   admin_users              │
│  src/proxy.ts guards       │        │   RLS: public read,        │
│  public vs admin routes    │        │        admin write          │
└────────────┬───────────────┘        └───────────┬─────────────────┘
             │ functions.invoke                    │ service role
             ▼                                     ▼
   ┌──────────────────────────────────────────────────────┐
   │  Supabase Edge Functions (Deno)                      │
   │  generate-artifact  — Groq: quotes/flashcards/moments│
   │  index-artifacts    — chunk + embed → pgvector       │
   │  ask                — embed query → vector search →  │
   │                       Groq answer with citations     │
   └──────────────────────────────────────────────────────┘
```

## Quickstart (demo mode — no database)

```bash
npm install
cp .env.local.example .env.local
# set NEXT_PUBLIC_DEMO_MODE=true in .env.local
npm run dev
```

Open http://localhost:3000. Browse the feed, ask the library (demo keyword matching), and visit `/admin` for the curator dashboard with seeded demo data.

## Full setup (Supabase + Vercel)

Follow the step-by-step runbook in **[DEPLOYMENT.md](DEPLOYMENT.md)**. In short:

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor
2. Add your email to the admin allowlist: `INSERT INTO admin_users (email) VALUES ('you@example.com');`
3. Configure Google OAuth under **Authentication → Providers**
4. Set secrets & deploy edge functions: `supabase functions deploy`
5. Create a Vercel project, add the env vars from `.env.local.example`, deploy
6. Insert content, hit **Reindex search**, and publish

> Embeddings use Supabase's **free built-in model** (`gte-small`) — there is no
> embedding API key to set up. If indexing hasn't run yet, Ask the Library
> falls back to keyword matching automatically.

## Environment variables

All variables are documented in [`.env.local.example`](.env.local.example). App vars live in Vercel; `GROQ_API_KEY` and `SUPADATA_API_KEY` are Supabase function secrets (`supabase secrets set`).

## Project structure

```
src/
  app/            # routes: /, /ask, /artifact/[slug], /role/[slug], /admin, /auth
  components/     # header, cards, flip cards, InspireMe, AskWidget, admin dashboard
  lib/
    types.ts      # shared TypeScript types
    queries.ts    # shared Supabase queries (demo-aware)
    demo-data.ts  # demo corpus for preview mode
    utils.ts      # slugify, admin allowlist, RAG chunk builder
  proxy.ts        # route guard middleware (public vs admin)
supabase/
  schema.sql      # full database schema: tables, RLS, pgvector, RPCs
  functions/      # Deno edge functions: generate-artifact, index-artifacts, ask
  config.toml     # Supabase CLI config (edge function JWT settings)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and feature ideas are welcome via issues; please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Found a vulnerability? See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © SatyaDileep
