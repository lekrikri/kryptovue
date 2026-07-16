import type { Candle, Price } from "./types";

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
