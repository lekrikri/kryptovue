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
