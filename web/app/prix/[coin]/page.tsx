import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchCandles } from "@/lib/api";
import { coinBySlug, COINS } from "@/lib/coins";
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
          Cours
        </Link>{" "}
        / <span className="text-gray-700">{coin.name}</span>
      </nav>

      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Cours du {coin.name}{" "}
            <span className="text-gray-400">{coin.ticker}</span>
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-mono text-3xl font-bold tabular-nums">
              {price !== undefined ? formatPrice(price) : "—"}
            </span>
            <ChangeBadge pct={pct} />
          </div>
        </div>
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
