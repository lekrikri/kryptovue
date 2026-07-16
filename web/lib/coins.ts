// Registre des cryptos suivies : mappe le symbole Binance vers un slug SEO,
// un nom lisible et un ticker. Source de vérité pour les pages /prix/[coin].

export interface Coin {
  symbol: string; // paire Binance, ex "btcusdt"
  slug: string; // slug SEO, ex "bitcoin"
  name: string; // nom affiché, ex "Bitcoin"
  ticker: string; // ex "BTC"
}

export const COINS: Coin[] = [
  { symbol: "btcusdt", slug: "bitcoin", name: "Bitcoin", ticker: "BTC" },
  { symbol: "ethusdt", slug: "ethereum", name: "Ethereum", ticker: "ETH" },
  { symbol: "solusdt", slug: "solana", name: "Solana", ticker: "SOL" },
  { symbol: "xrpusdt", slug: "xrp", name: "XRP", ticker: "XRP" },
  { symbol: "adausdt", slug: "cardano", name: "Cardano", ticker: "ADA" },
  { symbol: "dogeusdt", slug: "dogecoin", name: "Dogecoin", ticker: "DOGE" },
  { symbol: "dotusdt", slug: "polkadot", name: "Polkadot", ticker: "DOT" },
  { symbol: "linkusdt", slug: "chainlink", name: "Chainlink", ticker: "LINK" },
  { symbol: "avaxusdt", slug: "avalanche", name: "Avalanche", ticker: "AVAX" },
  { symbol: "ltcusdt", slug: "litecoin", name: "Litecoin", ticker: "LTC" },
];

const bySlug = new Map(COINS.map((c) => [c.slug, c]));
const bySymbol = new Map(COINS.map((c) => [c.symbol, c]));

export const coinBySlug = (slug: string): Coin | undefined => bySlug.get(slug);
export const coinBySymbol = (symbol: string): Coin | undefined =>
  bySymbol.get(symbol.toLowerCase());
