import type { Stat } from "@/content/sections";

export function StatBlock({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {stats.map((st) => (
        <div
          key={st.label}
          className="rounded-lg border border-black/10 p-4 dark:border-white/10"
        >
          <dt className="text-2xl font-bold">{st.value}</dt>
          <dd className="mt-1 text-xs text-black/50 dark:text-white/50">
            {st.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
