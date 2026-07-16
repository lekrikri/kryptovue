"use client";

import Link from "next/link";
import { COINS } from "@/lib/coins";
import { formatPrice } from "@/lib/format";
import type { Price } from "@/lib/types";
import { useTradeStream } from "@/hooks/useTradeStream";

// PriceTable affiche le top des cryptos. Les prix initiaux viennent du SSR
// (props), puis sont remplacés en direct par le flux SSE.
export function PriceTable({ initial }: { initial: Price[] }) {
  const live = useTradeStream();
  const initialMap = new Map(initial.map((p) => [p.symbol, p.price]));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Crypto</th>
            <th className="px-4 py-3 text-right">Prix</th>
            <th className="hidden px-4 py-3 text-right sm:table-cell">Live</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {COINS.map((coin) => {
            const price = live[coin.symbol] ?? initialMap.get(coin.symbol);
            const isLive = live[coin.symbol] !== undefined;
            return (
              <tr key={coin.symbol} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/prix/${coin.slug}`}
                    className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand"
                  >
                    <span>{coin.name}</span>
                    <span className="text-xs text-gray-400">{coin.ticker}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-900">
                  {price !== undefined ? formatPrice(price) : "—"}
                </td>
                <td className="hidden px-4 py-3 text-right sm:table-cell">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      isLive ? "bg-up animate-pulse" : "bg-gray-300"
                    }`}
                    title={isLive ? "Flux temps réel" : "Dernier prix connu"}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
