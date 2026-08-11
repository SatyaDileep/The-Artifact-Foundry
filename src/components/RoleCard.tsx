import Link from "next/link";
import type { Role } from "@/lib/types";

export default function RoleCard({ role }: { role: Role }) {
  return (
    <Link
      href={`/role/${role.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${role.accent} font-bold text-white`}
      >
        {role.name.charAt(0)}
      </div>
      <h3 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {role.title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{role.tagline}</p>
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {role.sources?.length ?? 0} curated sources
        </span>
        <span className="text-sm font-medium text-amber-700 group-hover:underline dark:text-amber-400">
          Explore path →
        </span>
      </div>
    </Link>
  );
}
