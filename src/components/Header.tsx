import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode, DEMO_ADMIN_EMAIL } from "@/lib/demo-data";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const effectiveUser = isDemoMode
    ? { email: DEMO_ADMIN_EMAIL }
    : user;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 font-bold text-white">
            A
          </span>
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Artifact Foundry
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/ask"
            className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 sm:inline"
          >
            Ask
          </Link>
          <Link
            href="/#paths"
            className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 sm:inline"
          >
            Paths
          </Link>
          {effectiveUser ? (
            <>
              <Link
                href="/admin"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                Dashboard
              </Link>
              <span className="hidden text-sm text-zinc-400 sm:inline">
                {effectiveUser.email}
              </span>
              {isDemoMode ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  Demo
                </span>
              ) : (
                <a
                  href="/auth/signout"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                >
                  Sign out
                </a>
              )}
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
