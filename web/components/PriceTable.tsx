"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { coinIcon } from "@/lib/coins";
import { formatCompact, formatMoney, type Currency } from "@/lib/format";
import { ChangeBadge } from "@/components/ChangeBadge";
import { Sparkline } from "@/components/Sparkline";
import { useTradeStream } from "@/hooks/useTradeStream";
import { useEurRate } from "@/hooks/useEurRate";

export interface Row {
  symbol: string;
  slug: string;
  name: string;
  ticker: string;
  color: string;
  price: number | null;
  changePct: number;
  spark: number[];
  marketCap: number | null;
}

// PriceTable : LIVE_FEED. Prix initiaux en SSR, remplacés en direct par le SSE.
export function PriceTable({ rows }: { rows: Row[] }) {
  const live = useTradeStream();
  const rate = useEurRate();
  const [ccy, setCcy] = useState<Currency>("usd");

  useEffect(() => {
    const saved = localStorage.getItem("kv_ccy");
    if (saved === "eur" || saved === "usd") setCcy(saved);
  }, []);

  function toggleCcy() {
    const next: Currency = ccy === "usd" ? "eur" : "usd";
    setCcy(next);
    localStorage.setItem("kv_ccy", next);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="flex items-center justify-end border-b border-line px-4 py-2">
        <button
          onClick={toggleCcy}
          className="rounded border border-line px-2.5 py-1 text-[10px] font-bold tracking-widest text-gray-400 hover:border-accent hover:text-accent"
          title="Changer de devise"
        >
          {ccy === "usd" ? "USD → EUR" : "EUR → USD"}
        </button>
      </div>
      <table className="w-full text-left">
        <thead className="border-b border-line text-[10px] uppercase tracking-widest text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium sm:px-5">ASSET_IDENT</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">VAL_UNIT (USD)</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">VAR_24H</th>
            <th className="hidden px-5 py-3 text-right font-medium md:table-cell">
              MKT_CAP
            </th>
            <th className="hidden px-5 py-3 text-right font-medium lg:table-cell">
              TND_7D_SCAN
            </th>
            <th className="hidden px-5 py-3 text-right font-medium sm:table-cell">
              OPS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          {rows.map((row) => {
            const livePrice = live[row.symbol];
            const price = livePrice ?? row.price;
            const isLive = livePrice !== undefined;
            return (
              <tr key={row.symbol} className="group transition-colors hover:bg-panel-2">
                <td className="px-4 py-3.5 sm:px-5">
                  <Link href={`/prix/${row.slug}`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coinIcon(row.ticker)}
                      alt={row.name}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full ring-1 ring-line"
                      loading="lazy"
                    />
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-white group-hover:text-accent">
                        {row.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500">
                        {row.ticker} · SPOT
                      </span>
                    </span>
                    {isLive && (
                      <span
                        className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
                        title="LIVE"
                      />
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-medium tabular-nums text-white sm:px-5">
                  {price !== null ? formatMoney(price, ccy, rate) : "—"}
                </td>
                <td className="px-4 py-3.5 text-right sm:px-5">
                  <ChangeBadge pct={row.changePct} />
                </td>
                <td className="hidden px-5 py-3.5 text-right text-sm tabular-nums text-gray-400 md:table-cell">
                  {row.marketCap ? formatCompact(row.marketCap, ccy, rate) : "—"}
                </td>
                <td className="hidden px-5 py-3.5 lg:table-cell">
                  <div className="flex justify-end">
                    <Sparkline
                      values={row.spark}
                      color={row.changePct >= 0 ? "#34d399" : "#f87171"}
                    />
                  </div>
                </td>
                <td className="hidden px-5 py-3.5 text-right sm:table-cell">
                  <span
                    className="text-gray-600 transition-colors hover:text-accent"
                    title="Watchlist"
                    aria-hidden
                  >
                    ★
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
