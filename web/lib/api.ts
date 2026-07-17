import type {
  Brief,
  Candle,
  CoinMeta,
  GlobalMeta,
  Indicators,
  News,
  NewsImpact,
  NoiseSignal,
  Price,
  Sentiment,
} from "./types";

// URL serveur (SSR / Server Components). En prod: http://api:8080 (réseau Docker).
const SERVER_API = process.env.API_URL ?? "http://localhost:8081";

interface ListResponse<T> {
  data: T[] | null;
  count: number;
}

async function getJSON<T>(path: string, revalidate = 10): Promise<T> {
  const res = await fetch(`${SERVER_API}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchPrices(): Promise<Price[]> {
  try {
    const body = await getJSON<ListResponse<Price>>("/api/v1/prices");
    return body.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchCandles(
  symbol: string,
  interval = "1m",
  limit = 500,
): Promise<Candle[]> {
  try {
    const body = await getJSON<ListResponse<Candle>>(
      `/api/v1/candles/${symbol}?interval=${interval}&limit=${limit}`,
    );
    return body.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchNews(limit = 12): Promise<News[]> {
  try {
    const body = await getJSON<ListResponse<News>>(`/api/v1/news?limit=${limit}`, 60);
    return body.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchNewsBySymbol(symbol: string, limit = 6): Promise<News[]> {
  try {
    const body = await getJSON<ListResponse<News>>(
      `/api/v1/news/${symbol}?limit=${limit}`,
      60,
    );
    return body.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchNewsImpact(symbol: string): Promise<NewsImpact[]> {
  try {
    const body = await getJSON<ListResponse<NewsImpact>>(
      `/api/v1/news-impact/${symbol}`,
      60,
    );
    return body.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchGlobalMeta(): Promise<GlobalMeta | null> {
  try {
    const body = await getJSON<{ data: GlobalMeta | null }>("/api/v1/global", 120);
    return body.data;
  } catch {
    return null;
  }
}

export async function fetchMarketMeta(): Promise<Record<string, CoinMeta>> {
  try {
    const body = await getJSON<ListResponse<CoinMeta>>("/api/v1/market-meta", 120);
    return Object.fromEntries((body.data ?? []).map((m) => [m.symbol, m]));
  } catch {
    return {};
  }
}

export async function fetchNoiseSignal(): Promise<NoiseSignal[]> {
  try {
    const body = await getJSON<ListResponse<NoiseSignal>>("/api/v1/noise-signal", 60);
    return body.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchIndicators(symbol: string): Promise<Indicators | null> {
  try {
    const body = await getJSON<{ data: Indicators | null }>(
      `/api/v1/indicators/${symbol}`,
      30,
    );
    return body.data;
  } catch {
    return null;
  }
}

export async function fetchBrief(): Promise<Brief | null> {
  try {
    const body = await getJSON<{ data: Brief | null }>("/api/v1/brief", 300);
    return body.data;
  } catch {
    return null;
  }
}

export async function fetchSentiment(): Promise<Record<string, Sentiment>> {
  try {
    const body = await getJSON<ListResponse<Sentiment>>("/api/v1/sentiment", 60);
    return Object.fromEntries((body.data ?? []).map((s) => [s.symbol, s]));
  } catch {
    return {};
  }
}
