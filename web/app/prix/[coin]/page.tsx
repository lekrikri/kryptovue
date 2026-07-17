import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  fetchCandles,
  fetchIndicators,
  fetchNewsImpact,
} from "@/lib/api";
import { coinBySlug, coinIcon, COINS } from "@/lib/coins";
import { changePercent, formatPrice } from "@/lib/format";
import { ChangeBadge } from "@/components/ChangeBadge";
import { CandlestickChart } from "@/components/CandlestickChart";
import { TechScan } from "@/components/TechScan";
import { NewsFeed } from "@/components/NewsFeed";

export const revalidate = 30;

export function generateStaticParams() {
  return COINS.map((c) => ({ coin: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ coin: string }>;
}): Promise<Metadata> {
  const { coin: slug } = await params;
  const coin = coinBySlug(slug);
  if (!coin) return { title: "Crypto introuvable" };
  return {
    title: `Cours du ${coin.name} (${coin.ticker}) en temps réel`,
    description: `Prix du ${coin.name} en direct, graphique en bougies et évolution du cours. Données de marché en temps réel, sans inscription.`,
    alternates: { canonical: `/prix/${coin.slug}` },
  };
}

export default async function CoinPage({
  params,
}: {
  params: Promise<{ coin: string }>;
}) {
  const { coin: slug } = await params;
  const coin = coinBySlug(slug);
  if (!coin) notFound();

  const [candles, newsImpact, indicators] = await Promise.all([
    fetchCandles(coin.symbol, "1m", 240),
    fetchNewsImpact(coin.symbol),
    fetchIndicators(coin.symbol),
  ]);
  const news = newsImpact.map((n) => n.news);
  const impacts: Record<string, number> = {};
  for (const n of newsImpact) {
    if (n.has_impact && n.impact_pct !== undefined) impacts[n.news.id] = n.impact_pct;
  }
  const last = candles.at(-1);
  const price = last?.close;
  const pct =
    candles.length >= 2
      ? changePercent(candles[0].open, candles[candles.length - 1].close)
      : 0;
  const high = candles.length ? Math.max(...candles.map((c) => c.high)) : null;
  const low = candles.length ? Math.min(...candles.map((c) => c.low)) : null;
  const volume = candles.reduce((s, c) => s + c.volume, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: `${coin.name} (${coin.ticker})`,
    category: "Cryptocurrency",
    url: `https://kryptovue.fr/prix/${coin.slug}`,
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-[11px] tracking-widest text-gray-500">
        <Link href="/" className="hover:text-accent">
          MARCHÉS
        </Link>{" "}
        / <span className="text-gray-300">{coin.ticker}_SPOT</span>
      </nav>

      <section className="relative overflow-hidden rounded-xl border border-line bg-panel p-6 sm:p-8">
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coinIcon(coin.ticker)}
            alt={coin.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full ring-1 ring-line"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {coin.name}{" "}
              <span className="text-sm tracking-widest text-gray-500">
                {coin.ticker}/USDT
              </span>
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-3xl font-bold tabular-nums text-white">
                {price !== undefined ? formatPrice(price) : "—"}
              </span>
              <ChangeBadge pct={pct} />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      </section>

      <section className="grid grid-cols-3 gap-3">
        <MiniStat label="HIGH_24H" value={high !== null ? formatPrice(high) : "—"} />
        <MiniStat label="LOW_24H" value={low !== null ? formatPrice(low) : "—"} />
        <MiniStat
          label="VOL_SCAN"
          value={volume ? `${volume.toFixed(2)} ${coin.ticker}` : "—"}
        />
      </section>

      <CandlestickChart candles={candles} />

      {indicators && indicators.points >= 2 && <TechScan ind={indicators} />}

      <section className="space-y-3">
        <h2 className="text-sm font-bold tracking-widest text-white">
          NEWS_SCAN :: {coin.ticker}
        </h2>
        <NewsFeed news={news} impacts={impacts} />
      </section>

      <section className="max-w-none text-sm text-gray-500">
        <p>
          {"// "}Cette page suit le cours du {coin.name} ({coin.ticker}) en temps
          réel à partir des transactions du marché. Le graphique en bougies
          affiche l&apos;ouverture, le plus haut, le plus bas et la clôture par
          minute. Informations à but éducatif — aucun conseil en investissement.
        </p>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}
