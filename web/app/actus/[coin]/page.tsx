import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchNewsBySymbol } from "@/lib/api";
import { coinBySlug, COINS } from "@/lib/coins";
import { NewsFeed } from "@/components/NewsFeed";

export const revalidate = 60;

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
    title: `Actualités ${coin.name} (${coin.ticker})`,
    description: `Les dernières actualités crypto en français concernant le ${coin.name} (${coin.ticker}), avec analyse de sentiment.`,
    alternates: { canonical: `/actus/${coin.slug}` },
  };
}

export default async function CoinNewsPage({
  params,
}: {
  params: Promise<{ coin: string }>;
}) {
  const { coin: slug } = await params;
  const coin = coinBySlug(slug);
  if (!coin) notFound();

  const news = await fetchNewsBySymbol(coin.symbol, 20);

  return (
    <div className="space-y-5">
      <nav className="text-[11px] tracking-widest text-gray-500">
        <Link href="/actus" className="hover:text-accent">
          ACTUS
        </Link>{" "}
        / <span className="text-gray-300">{coin.ticker}</span>
      </nav>
      <section className="rounded-xl border border-line bg-panel px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Actualités {coin.name}{" "}
          <span className="text-sm tracking-widest text-gray-500">{coin.ticker}</span>
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {"> "}Dernières actus FR mentionnant le {coin.name}, avec sentiment.
          {" "}
          <Link href={`/prix/${coin.slug}`} className="text-accent hover:underline">
            Voir le cours →
          </Link>
        </p>
      </section>
      <NewsFeed news={news} />
    </div>
  );
}
