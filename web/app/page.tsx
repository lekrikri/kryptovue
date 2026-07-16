import { buildRows } from "@/lib/rows";
import { PriceTable } from "@/components/PriceTable";

export const revalidate = 30;

export default async function HomePage() {
  const rows = await buildRows();
  const gainers = rows.filter((r) => r.changePct > 0).length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Données en direct · Binance
          </span>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Le radar crypto francophone, en temps réel
          </h1>
          <p className="text-white/80">
            Cours en direct, graphiques et heatmap du marché. Sans inscription,
            sans jargon.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
      </section>

      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Cryptos suivies" value={`${rows.length}`} />
        <Stat label="En hausse" value={`${gainers}`} accent="text-up" />
        <Stat label="En baisse" value={`${rows.length - gainers}`} accent="text-down" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Cours du marché</h2>
        <PriceTable rows={rows} />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-gray-900",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${accent}`}>
        {value}
      </div>
    </div>
  );
}
