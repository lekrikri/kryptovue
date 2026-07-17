import type { Metadata } from "next";
import Link from "next/link";
import { fetchNews } from "@/lib/api";
import { COINS, coinIcon } from "@/lib/coins";
import { NewsFeed } from "@/components/NewsFeed";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Actualités crypto francophones",
  description:
    "Les dernières actualités crypto en français (Journal du Coin, Cryptoast, Cointribune), avec analyse de sentiment par IA.",
  alternates: { canonical: "/actus" },
};

export default async function ActusPage() {
  const news = await fetchNews(15);
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-panel px-6 py-8">
        <div className="text-[11px] tracking-widest text-accent">{"// NEWS_FEED"}</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Actualités crypto francophones
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          {"> "}Agrégées depuis les médias FR et analysées par IA (sentiment).
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        {COINS.map((c) => (
          <Link
            key={c.symbol}
            href={`/actus/${c.slug}`}
            className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-gray-300 hover:border-accent hover:text-accent"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coinIcon(c.ticker)} alt={c.ticker} width={18} height={18} className="h-[18px] w-[18px] rounded-full" />
            {c.name}
          </Link>
        ))}
      </section>

      <NewsFeed news={news} />
    </div>
  );
}
