import type { Stat } from "@/content/sections";

export function StatBlock({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {stats.map((st) => (
        <div
          key={st.label}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <dt className="text-2xl font-bold text-neutral-50">{st.value}</dt>
          <dd className="mt-1 text-xs text-neutral-500">{st.label}</dd>
        </div>
      ))}
    </dl>
  );
}
