import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchCandles } from "@/lib/api";
import { coinBySlug, coinIcon, COINS } from "@/lib/coins";
import { changePercent, formatPrice } from "@/lib/format";
import { ChangeBadge } from "@/components/ChangeBadge";
import { CandlestickChart } from "@/components/CandlestickChart";

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

  const candles = await fetchCandles(coin.symbol, "1m", 240);
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

      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:text-brand">
          Marché
        </Link>{" "}
        / <span className="text-gray-700">{coin.name}</span>
      </nav>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-terminal px-6 py-8 text-white shadow-xl sm:px-8">
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coinIcon(coin.ticker)}
            alt={coin.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full bg-white/10 p-1"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {coin.name} <span className="text-white/50">{coin.ticker}</span>
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-3xl font-bold tabular-nums">
                {price !== undefined ? formatPrice(price) : "—"}
              </span>
              <ChangeBadge pct={pct} />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
      </section>

      <section className="grid grid-cols-3 gap-3">
        <MiniStat label="Plus haut" value={high !== null ? formatPrice(high) : "—"} />
        <MiniStat label="Plus bas" value={low !== null ? formatPrice(low) : "—"} />
        <MiniStat
          label="Volume"
          value={volume ? `${volume.toFixed(2)} ${coin.ticker}` : "—"}
        />
      </section>

      <CandlestickChart candles={candles} />

      <section className="prose prose-sm max-w-none text-gray-600">
        <p>
          Cette page suit le cours du {coin.name} ({coin.ticker}) en temps réel
          à partir des transactions du marché. Le graphique en bougies affiche
          l&apos;ouverture, le plus haut, le plus bas et la clôture par minute.
          Les informations sont fournies à titre éducatif et ne constituent pas
          un conseil en investissement.
        </p>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold tabular-nums text-gray-900">
        {value}
      </div>
    </div>
  );
}
