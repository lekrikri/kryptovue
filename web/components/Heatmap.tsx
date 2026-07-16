"use client";

import Link from "next/link";
import { COINS } from "@/lib/coins";
import { changePercent, formatChange } from "@/lib/format";
import type { Candle } from "@/lib/types";

// Heatmap : une tuile par crypto, couleur selon la variation sur la fenêtre de bougies.
export function Heatmap({ changes }: { changes: Record<string, Candle[]> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {COINS.map((coin) => {
        const candles = changes[coin.symbol] ?? [];
        const pct =
          candles.length >= 2
            ? changePercent(candles[0].open, candles[candles.length - 1].close)
            : 0;
        const intensity = Math.min(Math.abs(pct) / 5, 1); // sature à ±5 %
        const bg =
          pct >= 0
            ? `rgba(22, 163, 74, ${0.15 + intensity * 0.6})`
            : `rgba(220, 38, 38, ${0.15 + intensity * 0.6})`;
        return (
          <Link
            key={coin.symbol}
            href={`/prix/${coin.slug}`}
            className="flex flex-col justify-between rounded-xl p-4 text-gray-900 transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: bg }}
          >
            <div className="text-sm font-semibold">{coin.ticker}</div>
            <div className="mt-2 text-lg font-bold tabular-nums">
              {formatChange(pct)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
