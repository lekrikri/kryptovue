import Link from "next/link";
import { COINS, coinIcon } from "@/lib/coins";
import { changePercent, formatChange } from "@/lib/format";
import type { Candle } from "@/lib/types";

// Heatmap : une tuile par crypto, couleur selon la variation sur la fenêtre.
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
            ? `rgba(52, 211, 153, ${0.06 + intensity * 0.4})`
            : `rgba(248, 113, 113, ${0.06 + intensity * 0.4})`;
        const ring = pct >= 0 ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)";
        return (
          <Link
            key={coin.symbol}
            href={`/prix/${coin.slug}`}
            className="flex flex-col justify-between gap-3 rounded-lg border p-4 text-white transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: bg, borderColor: ring }}
          >
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coinIcon(coin.ticker)}
                alt={coin.name}
                width={22}
                height={22}
                className="h-[22px] w-[22px] rounded-full ring-1 ring-line"
              />
              <span className="text-xs font-semibold tracking-wider">
                {coin.ticker}
              </span>
            </div>
            <div
              className={`text-lg font-bold tabular-nums ${pct >= 0 ? "text-up" : "text-down"}`}
            >
              {formatChange(pct)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
