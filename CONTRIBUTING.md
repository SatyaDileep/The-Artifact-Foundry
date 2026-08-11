# Contributing to Artifact Foundry

Thanks for helping make curated, AI-distilled knowledge accessible to everyone. Here's how to contribute well.

## Ground rules

- **Keep it boring.** Prefer simple, obvious solutions over clever ones.
- **Touch only what you were asked to.** No unsolicited refactors or drive-by cleanup.
- **Verify before you claim done.** Typecheck, lint, build, and test your change.
- **Never commit secrets.** `.env.local`, service-role keys, and API keys stay out of git.
- **Public routes stay public.** `/`, `/ask`, `/artifact`, `/role` are visitor-facing by design.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_DEMO_MODE=true for a DB-free preview
npm run dev
```

Commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | local dev server |
| `npm run build` | production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | typecheck |
| `npm test` | unit tests (vitest) |

## Finding work

- Open issues labeled `good first issue` and `help wanted`
- Ideas: better demo content, new career paths, flashcard review mode, RSS feed, OG image generation

## Making changes

1. Fork the repo and create a branch: `git checkout -b feat/your-change`
2. Make focused commits with clear messages
3. Run `npm run build`, `npm run lint`, `npm test`, and `npx tsc --noEmit` — all must pass
4. Push and open a pull request describing the *why* of the change

## Database & edge functions

- Schema changes go in `supabase/schema.sql` (keep it idempotent: `IF NOT EXISTS`, `DROP POLICY IF EXISTS`).
- Edge functions under `supabase/functions/` are Deno (not covered by `tsconfig`). Test them with `deno check supabase/functions/<name>/index.ts` if you have Deno installed, and re-run them against a Supabase project before shipping.
- RLS is the security boundary: writes are admin-only via `admin_users`. New write paths must respect that.

## Code of conduct

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md).
