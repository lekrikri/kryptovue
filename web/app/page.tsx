import Link from "next/link";
import { buildRows } from "@/lib/rows";
import { fetchBrief, fetchNews } from "@/lib/api";
import { formatChange, formatPrice } from "@/lib/format";
import { PriceTable } from "@/components/PriceTable";
import { SentimentGauge } from "@/components/SentimentGauge";
import { NewsFeed } from "@/components/NewsFeed";

export const revalidate = 30;

export default async function HomePage() {
  const [rows, news, brief] = await Promise.all([
    buildRows(),
    fetchNews(8),
    fetchBrief(),
  ]);
  const gainers = rows.filter((r) => r.changePct > 0).length;
  const losers = rows.length - gainers;
  const avgChange = rows.reduce((s, r) => s + r.changePct, 0) / (rows.length || 1);
  const btc = rows.find((r) => r.symbol === "btcusdt");
  const sentiment = Math.round((gainers / (rows.length || 1)) * 100);

  return (
    <div className="space-y-5">
      {/* Hero terminal */}
      <section className="relative overflow-hidden rounded-xl border border-line bg-panel p-6 sm:p-8">
        <div className="mb-5 text-[11px] tracking-widest text-accent">
          <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-accent align-middle" />
          {"// TERMINAL_STATUS: ONLINE // LATENCY: 0.2MS"}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-none tracking-tight text-white sm:text-5xl">
              TERMINAL VISION:
              <br />
              <span className="italic text-accent">ALPHA-SCAN</span>
            </h1>
            <p className="max-w-md text-sm text-gray-400">
              {"> protocole initialisé. analyse des flux de liquidité mondiaux. "}
              {"correspondance des coordonnées en cours."}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="#feed"
                className="rounded-md bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-bg transition-colors hover:bg-teal-300"
              >
                Initialize Terminal
              </Link>
              <Link
                href="/heatmap"
                className="rounded-md border border-line px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-300 transition-colors hover:border-accent hover:text-accent"
              >
                Global Heatmap
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Panel label="BTC_LAST" value={btc?.price ? formatPrice(btc.price) : "—"} sub="SPOT // BINANCE" />
              <Panel
                label="AVG_DELTA_24H"
                value={formatChange(avgChange)}
                sub={`${gainers}/${rows.length} ASSETS_UP`}
                accent={avgChange >= 0 ? "text-up" : "text-down"}
              />
            </div>
            <div className="rounded-lg border border-line bg-panel-2 p-4">
              <SentimentGauge value={sentiment} />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Briefing IA */}
      {brief && (
        <section className="rounded-lg border border-accent/30 bg-panel p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest text-accent">
              MARKET_BRIEF :: DAILY_SYNTH
            </h2>
            <span className="text-[10px] tracking-widest text-gray-500">
              GEN_BY :: {brief.model}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-300">{brief.content}</p>
        </section>
      )}

      {/* Cartes stats */}
      <section className="grid grid-cols-3 gap-3">
        <StatCard label="ASSETS_ACT" value={`${rows.length}`} sub="MANUAL_CTRL_V3" />
        <StatCard label="GAINERS_PRT" value={`${gainers}`} sub="+NET_DELTA" accent="text-up" />
        <StatCard label="LOSERS_PRT" value={`${losers}`} sub="-NET_DELTA" accent="text-down" />
      </section>

      {/* LIVE_FEED */}
      <section id="feed" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white">
              LIVE_FEED :: MARKET_OS
            </h2>
            <p className="text-[11px] tracking-wide text-gray-500">
              {"// data output cycle: enabled // realtime modification active"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-widest">
            <span className="rounded border border-line bg-panel px-3 py-1.5 text-gray-400">
              ↕ BY_CAP
            </span>
            <span className="rounded border border-line bg-panel px-3 py-1.5 text-gray-400">
              ⚙ FILTERS_01
            </span>
          </div>
        </div>
        <PriceTable rows={rows} />
      </section>

      {/* NEWS_FEED */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-white">
            NEWS_FEED :: SENTIMENT_SCAN
          </h2>
          <p className="text-[11px] tracking-wide text-gray-500">
            {"// actus crypto francophones analysées par IA (sentiment)"}
          </p>
        </div>
        <NewsFeed news={news} />
      </section>
    </div>
  );
}

function Panel({
  label,
  value,
  sub,
  accent = "text-white",
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel-2 p-3">
      <div className="text-[10px] uppercase tracking-widest text-gray-500">
        {label}
      </div>
      <div className={`mt-1 text-lg font-bold tabular-nums ${accent}`}>{value}</div>
      <div className="mt-0.5 text-[10px] tracking-wider text-gray-600">{sub}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = "text-white",
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="text-[10px] uppercase tracking-widest text-gray-500">
        {label}
      </div>
      <div className={`mt-2 text-3xl font-bold tabular-nums ${accent}`}>
        {value}
      </div>
      <div className="mt-1 text-[10px] tracking-wider text-gray-600">{sub}</div>
    </div>
  );
}
