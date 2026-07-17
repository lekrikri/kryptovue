import { fetchCandles, fetchMarketMeta, fetchPrices } from "./api";
import { COINS } from "./coins";
import { changePercent } from "./format";
import type { Row } from "@/components/PriceTable";

// buildRows agrège prix + bougies + métadonnées CoinGecko (market cap, vraie
// variation 24h) pour alimenter le tableau d'accueil.
export async function buildRows(): Promise<Row[]> {
  const [prices, meta, candlesPerCoin] = await Promise.all([
    fetchPrices(),
    fetchMarketMeta(),
    Promise.all(COINS.map((c) => fetchCandles(c.symbol, "1m", 90))),
  ]);
  const priceMap = new Map(prices.map((p) => [p.symbol, p.price]));

  return COINS.map((coin, i) => {
    const candles = candlesPerCoin[i];
    const spark = candles.map((c) => c.close);
    const m = meta[coin.symbol];
    // Variation 24h réelle (CoinGecko) si disponible, sinon repli sur les bougies.
    const changePct =
      m?.change_24h !== undefined && m.change_24h !== 0
        ? m.change_24h
        : candles.length >= 2
          ? changePercent(candles[0].open, candles[candles.length - 1].close)
          : 0;
    const price = priceMap.get(coin.symbol) ?? candles.at(-1)?.close ?? null;
    return {
      symbol: coin.symbol,
      slug: coin.slug,
      name: coin.name,
      ticker: coin.ticker,
      color: coin.color,
      price,
      changePct,
      spark,
      marketCap: m?.market_cap ?? null,
    };
  });
}
