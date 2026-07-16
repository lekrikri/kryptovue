import type { Metadata } from "next";
import { fetchCandles } from "@/lib/api";
import { COINS } from "@/lib/coins";
import { Heatmap } from "@/components/Heatmap";
import type { Candle } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Heatmap du marché crypto",
  description:
    "Visualisez d'un coup d'œil les performances des principales cryptomonnaies sur la dernière heure.",
};

export default async function HeatmapPage() {
  const entries = await Promise.all(
    COINS.map(
      async (coin) =>
        [coin.symbol, await fetchCandles(coin.symbol, "1m", 60)] as const,
    ),
  );
  const changes: Record<string, Candle[]> = Object.fromEntries(entries);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-terminal px-6 py-8 text-white shadow-xl sm:px-10">
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl">Heatmap du marché</h1>
          <p className="max-w-lg text-white/70">
            Performance des principales cryptos sur la dernière heure, d&apos;un
            seul coup d&apos;œil.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
      </section>
      <Heatmap changes={changes} />
    </div>
  );
}
