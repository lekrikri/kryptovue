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
        background: { color: "#0c111b" },
        textColor: "#64748b",
      },
      grid: {
        vertLines: { color: "#1b2635" },
        horzLines: { color: "#1b2635" },
      },
      timeScale: { timeVisible: true, borderColor: "#1b2635" },
      rightPriceScale: { borderColor: "#1b2635" },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderVisible: false,
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
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
      <div className="flex h-[360px] items-center justify-center rounded-lg border border-line bg-panel text-sm text-gray-500">
        {"// awaiting market data — le graphique se remplira en direct"}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[360px] w-full rounded-lg border border-line bg-panel p-2"
    />
  );
}
