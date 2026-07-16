"use client";

import Link from "next/link";
import { coinIcon } from "@/lib/coins";
import { formatPrice } from "@/lib/format";
import { ChangeBadge } from "@/components/ChangeBadge";
import { Sparkline } from "@/components/Sparkline";
import { useTradeStream } from "@/hooks/useTradeStream";

export interface Row {
  symbol: string;
  slug: string;
  name: string;
  ticker: string;
  color: string;
  price: number | null;
  changePct: number;
  spark: number[];
}

// PriceTable affiche le top des cryptos. Prix initiaux en SSR (props),
// remplacés en direct par le flux SSE.
export function PriceTable({ rows }: { rows: Row[] }) {
  const live = useTradeStream();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium sm:px-6">Crypto</th>
            <th className="px-4 py-3 text-right font-medium sm:px-6">Prix</th>
            <th className="px-4 py-3 text-right font-medium sm:px-6">24 h</th>
            <th className="hidden px-6 py-3 text-right font-medium lg:table-cell">
              Tendance
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => {
            const livePrice = live[row.symbol];
            const price = livePrice ?? row.price;
            const isLive = livePrice !== undefined;
            return (
              <tr key={row.symbol} className="group transition-colors hover:bg-gray-50/80">
                <td className="px-4 py-4 sm:px-6">
                  <Link href={`/prix/${row.slug}`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coinIcon(row.ticker)}
                      alt={row.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                      loading="lazy"
                    />
                    <span className="flex flex-col">
                      <span className="font-semibold text-gray-900 group-hover:text-brand">
                        {row.name}
                      </span>
                      <span className="text-xs uppercase text-gray-400">
                        {row.ticker}
                      </span>
                    </span>
                    {isLive && (
                      <span
                        className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-up"
                        title="Temps réel"
                      />
                    )}
                  </Link>
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm font-medium tabular-nums text-gray-900 sm:px-6">
                  {price !== null ? formatPrice(price) : "—"}
                </td>
                <td className="px-4 py-4 text-right sm:px-6">
                  <ChangeBadge pct={row.changePct} />
                </td>
                <td className="hidden px-6 py-4 lg:table-cell">
                  <div className="flex justify-end">
                    <Sparkline
                      values={row.spark}
                      color={row.changePct >= 0 ? "#16a34a" : "#dc2626"}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
