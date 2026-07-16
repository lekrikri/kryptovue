import Link from "next/link";
import { buildRows } from "@/lib/rows";
import { formatChange, formatPrice } from "@/lib/format";
import { PriceTable } from "@/components/PriceTable";
import { SentimentGauge } from "@/components/SentimentGauge";

export const revalidate = 30;

export default async function HomePage() {
  const rows = await buildRows();
  const gainers = rows.filter((r) => r.changePct > 0).length;
  const losers = rows.length - gainers;
  const avgChange =
    rows.reduce((s, r) => s + r.changePct, 0) / (rows.length || 1);
  const btc = rows.find((r) => r.symbol === "btcusdt");
  const sentiment = Math.round((gainers / (rows.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Hero terminal */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-terminal px-6 py-9 text-white shadow-xl sm:px-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Données en direct · Binance
            </span>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Le radar crypto{" "}
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "1px rgba(255,255,255,0.55)" }}
              >
                intelligent
              </span>
            </h1>
            <p className="max-w-md text-white/70">
              Analysez les flux du marché mondial en temps réel. Un terminal
              francophone conçu pour la clarté, sans inscription.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="#marche"
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-terminal transition-colors hover:bg-emerald-400"
              >
                Ouvrir le terminal
              </Link>
              <Link
                href="/heatmap"
                className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Heatmap globale
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-1">
            <div className="grid grid-cols-2 gap-3">
              <Pill label="Bitcoin" value={btc?.price ? formatPrice(btc.price) : "—"} />
              <Pill
                label="Variation moy. 24 h"
                value={formatChange(avgChange)}
                accent={avgChange >= 0 ? "text-emerald-400" : "text-red-400"}
              />
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <SentimentGauge value={sentiment} />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </section>

      {/* Cartes stats */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Actifs suivis" value={`${rows.length}`} hint="Gestion personnalisée" />
        <StatCard label="En hausse" value={`${gainers}`} accent="text-up" hint="sur 24 h" up />
        <StatCard label="En baisse" value={`${losers}`} accent="text-down" hint="sur 24 h" />
      </section>

      {/* Tableau du marché */}
      <section id="marche" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Cours du marché en direct
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600">
              Par capitalisation
            </span>
            <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600">
              Filtres
            </span>
          </div>
        </div>
        <PriceTable rows={rows} />
      </section>
    </div>
  );
}

function Pill({
  label,
  value,
  accent = "text-white",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className={`mt-1 font-mono text-lg font-bold tabular-nums ${accent}`}>
        {value}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent = "text-gray-900",
  up,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: string;
  up?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-gray-400">
          {label}
        </span>
        <span className={up ? "text-up" : accent}>
          {up ? "▲" : label === "En baisse" ? "▼" : "•"}
        </span>
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${accent}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-gray-400">{hint}</div>
    </div>
  );
}
