# Security Policy

## Reporting a vulnerability

Artifact Foundry is an open-source project. If you find a security issue, please
report it privately rather than in a public issue:

1. Open a **private security advisory** on GitHub:
   `https://github.com/SatyaDileep/The-Artifact-Foundry/security/advisories/new`
2. Or email the maintainers (linked on the repository profile).

Please include:

- The affected endpoint/component and version
- Steps to reproduce
- Impact and, if you have one, a suggested fix

You should expect an initial response within 3 business days.

## Scope

- Web application routes under `src/`
- Supabase schema, RLS policies, and Edge Functions under `supabase/`
- Authentication and admin authorization flows

## Out of scope

- Social engineering of maintainers or users
- Self-inflicted damage (e.g., deleting your own Supabase project)
- Attacks that require physical access to a user's machine

## Security notes for maintainers

- **Never** commit `.env.local` or any key; `ADMIN_EMAILS`, `GROQ_API_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, and `SUPADATA_API_KEY` are server-side only.
- RLS is the security boundary — admin-only writes are enforced in
  `supabase/schema.sql` via the `admin_users` allowlist.
- The `ask` edge function is intentionally public (`verify_jwt = false`);
  keep its prompt grounded and do not echo raw user input without escaping.
