import type { Metadata } from "next";
import { fetchCandles, fetchCorrelations } from "@/lib/api";
import { COINS } from "@/lib/coins";
import { Heatmap } from "@/components/Heatmap";
import { CorrelationMatrix } from "@/components/CorrelationMatrix";
import type { Candle } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Heatmap du marché crypto",
  description:
    "Visualisez d'un coup d'œil les performances des principales cryptomonnaies sur la dernière heure.",
};

export default async function HeatmapPage() {
  const [entries, correlations] = await Promise.all([
    Promise.all(
      COINS.map(
        async (coin) =>
          [coin.symbol, await fetchCandles(coin.symbol, "1m", 60)] as const,
      ),
    ),
    fetchCorrelations(),
  ]);
  const changes: Record<string, Candle[]> = Object.fromEntries(entries);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-line bg-panel px-6 py-8 sm:px-10">
        <div className="relative z-10 space-y-2">
          <div className="text-[11px] tracking-widest text-accent">
            {"// HEATMAP_SCAN :: 1H_WINDOW"}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            HEATMAP DU MARCHÉ
          </h1>
          <p className="max-w-lg text-sm text-gray-400">
            {"> "}Performance des principales cryptos sur la dernière heure, d&apos;un
            seul coup d&apos;œil.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      </section>
      <Heatmap changes={changes} />

      {correlations && correlations.symbols.length > 1 && (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white">
              CORRELATION :: MATRIX
            </h2>
            <p className="text-[11px] tracking-wide text-gray-500">
              {"// corrélation des rendements — vert = évoluent ensemble, rouge = en sens inverse"}
            </p>
          </div>
          <CorrelationMatrix data={correlations} />
        </section>
      )}
    </div>
  );
}
