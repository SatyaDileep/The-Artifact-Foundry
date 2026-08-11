# AGENTS.md — The Artifact Foundry

## Project Overview
A high-signal knowledge hub through AI-structured Learning Artifacts. Next.js (React) web app with Supabase backend. Curators ingest content, AI generates quotes/top-moments/flashcards, and visitors browse a public, SEO-friendly feed.

## Tech Stack
- **Framework:** Next.js (App Router, Server Components)
- **UI:** React 19, Tailwind CSS v4
- **Data Fetching:** TanStack React Query (client), Server Components (SSR)
- **Backend:** Supabase (Auth, Postgres, Edge Functions)
- **Auth:** Supabase Auth (Google OAuth) via @supabase/ssr
- **Styling:** Tailwind CSS utility classes, dark mode via `dark:` variants

## Commands
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Start (prod): `npm start`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Test: `npm test` (vitest)

## Code Conventions
- Use Server Components by default; add `"use client"` only for interactivity
- Supabase server client (`createClient` from `@/lib/supabase/server`) in Server Components; browser client (`@/lib/supabase/client`) in client components
- Put shared queries in `@/lib/queries.ts` (take a `SupabaseClient` param)
- Types live in `@/lib/types.ts`; keep snake_case DB columns in the interfaces
- Public routes: `/`, `/ask`, `/auth`, `/artifact`, `/role`. Everything else requires auth (see `src/proxy.ts`)
- Don't commit `.env.local` or any secrets

## Boundaries
- Never commit `.env.local` or secrets
- Never expose `GROQ_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` to the browser (server-only)
- Ask before modifying Supabase schema
- Admin writes are allowlisted via `ADMIN_EMAILS` (app) and the `admin_users` table (RLS)
- RAG: `index-artifacts` chunks + embeds into `artifact_chunks` (pgvector); `ask` answers with citations; embeddings come from Supabase's free built-in `gte-small` model (`Supabase.ai.Session`), falling back to keyword search
- Always run `npm run build`, `npm run lint`, and `npm test` before committing
- The Deno Edge Functions under `supabase/` are type-checked separately (excluded from `tsconfig`); don't reference them in app code

---

## Agent Skills — Mandatory Workflows

This project uses the [agent-skills](../agent-skills/) collection. Before starting any task, identify the development phase and apply the corresponding skill. Read the relevant `SKILL.md` from `../agent-skills/skills/<skill-name>/SKILL.md`.

### Skill Discovery Flow

```
Task arrives
    │
    ├── Vague idea/need refinement? ──→ idea-refine
    ├── New feature/change? ──────────→ spec-driven-development
    ├── Have a spec, need tasks? ──────→ planning-and-task-breakdown
    ├── Implementing code? ────────────→ incremental-implementation
    │   ├── UI/widget work? ──────────→ frontend-ui-engineering
    │   ├── API/backend work? ────────→ api-and-interface-design
    │   └── Need better context? ─────→ context-engineering
    ├── Writing/running tests? ────────→ test-driven-development
    ├── Something broke? ──────────────→ debugging-and-error-recovery
    ├── Reviewing code? ───────────────→ code-review-and-quality
    │   ├── Security concerns? ───────→ security-and-hardening
    │   └── Performance concerns? ────→ performance-optimization
    ├── Committing/branching? ─────────→ git-workflow-and-versioning
    ├── CI/CD pipeline work? ──────────→ ci-cd-and-automation
    ├── Writing docs/ADRs? ───────────→ documentation-and-adrs
    └── Deploying/launching? ─────────→ shipping-and-launch
```

### Core Operating Behaviors (Non-Negotiable)

1. **Surface Assumptions** — Before implementing anything, explicitly state assumptions and wait for correction.
2. **Manage Confusion** — When requirements conflict with existing code, STOP and ask. Never guess.
3. **Push Back When Warranted** — Point out clear problems with concrete downsides. Propose alternatives.
4. **Enforce Simplicity** — Prefer the boring, obvious solution. Cleverness is expensive.
5. **Maintain Scope Discipline** — Touch only what is asked. No unsolicited cleanup or refactoring.
6. **Verify, Don't Assume** — Every task must have evidence of completion (tests pass, `flutter analyze` clean, app runs).

### Failure Modes to Avoid
- Making assumptions without surfacing them
- Skipping verification because "it looks right"
- Building without a spec because "it's obvious"
- Modifying code orthogonal to the task
- Adding dependencies without justification
- Not running `flutter analyze` before committing

### Typical Skill Sequence for New Features
1. `idea-refine` → Refine vague ideas
2. `spec-driven-development` → Define what we're building
3. `planning-and-task-breakdown` → Break into verifiable chunks
4. `context-engineering` → Load the right context
5. `incremental-implementation` → Build slice by slice
6. `test-driven-development` → Prove each slice works
7. `code-review-and-quality` → Review before merge
8. `git-workflow-and-versioning` → Clean commit history
9. `documentation-and-adrs` → Document decisions
10. `shipping-and-launch` → Deploy safely

Not every task needs every skill. A bug fix might only need: `debugging-and-error-recovery` → `test-driven-development` → `code-review-and-quality`.
