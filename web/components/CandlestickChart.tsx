"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "@/lib/types";

// CandlestickChart monte un graphique TradingView lightweight-charts (client only).
export function CandlestickChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart: IChartApi = createChart(container, {
      autoSize: true,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#334155",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      timeScale: { timeVisible: true, borderColor: "#e2e8f0" },
      rightPriceScale: { borderColor: "#e2e8f0" },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });

    series.setData(
      candles.map((c) => ({
        time: (Date.parse(c.bucket_start) / 1000) as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [candles]);

  if (candles.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400">
        Pas encore de données de marché — le graphique se remplira en direct.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[360px] w-full rounded-xl border border-gray-200 bg-white p-2"
    />
  );
}
