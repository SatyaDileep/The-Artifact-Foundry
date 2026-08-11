import { Suspense } from "react";
import GoogleButton from "./google-button";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Curator access
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to publish and manage learning artifacts. Visitors can browse
          the feed without an account.
        </p>
        <div className="mt-6">
          <Suspense>
            <GoogleButton />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
