import { fetchCandles, fetchPrices } from "./api";
import { COINS } from "./coins";
import { changePercent } from "./format";
import type { Row } from "@/components/PriceTable";

// buildRows agrège prix + bougies récentes pour alimenter le tableau d'accueil
// (prix, variation sur la fenêtre, série pour la sparkline).
export async function buildRows(): Promise<Row[]> {
  const prices = await fetchPrices();
  const priceMap = new Map(prices.map((p) => [p.symbol, p.price]));

  const candlesPerCoin = await Promise.all(
    COINS.map((c) => fetchCandles(c.symbol, "1m", 90)),
  );

  return COINS.map((coin, i) => {
    const candles = candlesPerCoin[i];
    const spark = candles.map((c) => c.close);
    const changePct =
      candles.length >= 2
        ? changePercent(candles[0].open, candles[candles.length - 1].close)
        : 0;
    const price =
      priceMap.get(coin.symbol) ?? candles.at(-1)?.close ?? null;
    return {
      symbol: coin.symbol,
      slug: coin.slug,
      name: coin.name,
      ticker: coin.ticker,
      color: coin.color,
      price,
      changePct,
      spark,
    };
  });
}
