import Link from "next/link";
import { coinBySymbol, coinIcon } from "@/lib/coins";
import type { NoiseSignal } from "@/lib/types";

const LABEL_STYLE: Record<NoiseSignal["label"], string> = {
  BRUIT: "text-amber-400 ring-amber-400/30 bg-amber-400/10",
  SIGNAL: "text-cyan ring-cyan/30 bg-cyan/10",
  ACTIF: "text-up ring-up/30 bg-up/10",
  CALME: "text-gray-500 ring-white/10 bg-white/5",
};

export function NoiseSignalPanel({ items }: { items: NoiseSignal[] }) {
  // Priorité aux actifs "intéressants" (bruit/signal/actif) puis par buzz.
  const rank: Record<NoiseSignal["label"], number> = {
    BRUIT: 0,
    SIGNAL: 1,
    ACTIF: 2,
    CALME: 3,
  };
  const sorted = [...items].sort(
    (a, b) => rank[a.label] - rank[b.label] || b.buzz - a.buzz,
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {sorted.map((it) => {
        const coin = coinBySymbol(it.symbol);
        return (
          <Link
            key={it.symbol}
            href={coin ? `/prix/${coin.slug}` : "#"}
            className="rounded-lg border border-line bg-panel p-3 transition-colors hover:bg-panel-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coinIcon(coin?.ticker ?? it.symbol)}
                  alt={coin?.ticker ?? it.symbol}
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px] rounded-full ring-1 ring-line"
                />
                <span className="text-xs font-semibold tracking-wider text-gray-200">
                  {coin?.ticker ?? it.symbol}
                </span>
              </div>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest ring-1 ${LABEL_STYLE[it.label]}`}
              >
                {it.label}
              </span>
            </div>
            {/* Barres buzz (média) vs move (prix) */}
            <div className="mt-3 space-y-1.5">
              <Bar label="MÉDIA" value={it.buzz} color="#fbbf24" />
              <Bar label="PRIX" value={it.move} color="#22d3ee" />
            </div>
            <div className="mt-2 text-[9px] tracking-wide text-gray-600">
              {it.news_count} actus / 24h
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[9px] tracking-wider text-gray-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
