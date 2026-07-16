// Registre des cryptos suivies : mappe le symbole Binance vers un slug SEO,
// un nom lisible, un ticker, une couleur de marque et un logo.

export interface Coin {
  symbol: string; // paire Binance, ex "btcusdt"
  slug: string; // slug SEO, ex "bitcoin"
  name: string; // nom affiché, ex "Bitcoin"
  ticker: string; // ex "BTC"
  color: string; // couleur de marque (sparkline, accents)
}

export const COINS: Coin[] = [
  { symbol: "btcusdt", slug: "bitcoin", name: "Bitcoin", ticker: "BTC", color: "#f7931a" },
  { symbol: "ethusdt", slug: "ethereum", name: "Ethereum", ticker: "ETH", color: "#627eea" },
  { symbol: "solusdt", slug: "solana", name: "Solana", ticker: "SOL", color: "#14b8a6" },
  { symbol: "xrpusdt", slug: "xrp", name: "XRP", ticker: "XRP", color: "#334155" },
  { symbol: "adausdt", slug: "cardano", name: "Cardano", ticker: "ADA", color: "#0033ad" },
  { symbol: "dogeusdt", slug: "dogecoin", name: "Dogecoin", ticker: "DOGE", color: "#c2a633" },
  { symbol: "dotusdt", slug: "polkadot", name: "Polkadot", ticker: "DOT", color: "#e6007a" },
  { symbol: "linkusdt", slug: "chainlink", name: "Chainlink", ticker: "LINK", color: "#2a5ada" },
  { symbol: "avaxusdt", slug: "avalanche", name: "Avalanche", ticker: "AVAX", color: "#e84142" },
  { symbol: "ltcusdt", slug: "litecoin", name: "Litecoin", ticker: "LTC", color: "#345d9d" },
];

// Logo depuis le CDN cryptocurrency-icons (jsDelivr, fiable, gratuit).
export function coinIcon(ticker: string): string {
  return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1.0.0/128/color/${ticker.toLowerCase()}.png`;
}

const bySlug = new Map(COINS.map((c) => [c.slug, c]));
const bySymbol = new Map(COINS.map((c) => [c.symbol, c]));

export const coinBySlug = (slug: string): Coin | undefined => bySlug.get(slug);
export const coinBySymbol = (symbol: string): Coin | undefined =>
  bySymbol.get(symbol.toLowerCase());
