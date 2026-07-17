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

export interface Brief {
  content: string;
  model: string;
  created_at: string;
}

export interface NewsImpact {
  news: News;
  has_impact: boolean;
  price_at?: number;
  price_next?: number;
  impact_pct?: number;
}

export interface NoiseSignal {
  symbol: string;
  news_count: number;
  volatility: number;
  buzz: number;
  move: number;
  label: "BRUIT" | "SIGNAL" | "ACTIF" | "CALME";
}

export interface Indicators {
  symbol: string;
  rsi: number;
  rsi_zone: "surachat" | "survente" | "neutre";
  macd: number;
  macd_signal: number;
  macd_hist: number;
  sma20: number;
  ema50: number;
  volatility: number;
  volume_zscore: number;
  return_zscore: number;
  anomaly: boolean;
  anomaly_note: string;
  points: number;
}
