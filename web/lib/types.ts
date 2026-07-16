export interface Price {
  symbol: string;
  price: number;
  updated_at: string;
}

export interface Candle {
  symbol: string;
  bucket_start: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trade_count: number;
}

export interface Trade {
  symbol: string;
  price: number;
  qty: number;
  ts_ms: number;
  source: string;
}

export interface News {
  id: string;
  source: string;
  title: string;
  url: string;
  summary: string;
  published_at: string;
  coins: string[];
  sentiment_score: number;
  sentiment_label: "positive" | "neutral" | "negative";
}

export interface Sentiment {
  symbol: string;
  score: number;
  label: "positive" | "neutral" | "negative";
  count: number;
}
