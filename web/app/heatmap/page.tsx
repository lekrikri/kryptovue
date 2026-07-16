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
      <section className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Heatmap du marché</h1>
        <p className="text-gray-600">
          Variation des principales cryptos sur la dernière heure.
        </p>
      </section>
      <Heatmap changes={changes} />
    </div>
  );
}
