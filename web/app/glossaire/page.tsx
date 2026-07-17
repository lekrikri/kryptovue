import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Glossaire crypto — comprendre les termes essentiels",
  description:
    "Définitions claires et en français des termes crypto essentiels : Bitcoin, blockchain, staking, DeFi, halving, stablecoin et plus.",
  alternates: { canonical: "/glossaire" },
};

export default function GlossairePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-panel px-6 py-8">
        <div className="text-[11px] tracking-widest text-accent">{"// GLOSSAIRE"}</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Le crypto expliqué simplement
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          {"> "}Les termes essentiels de la cryptomonnaie, définis clairement et
          sans jargon.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {GLOSSARY.map((t) => (
          <Link
            key={t.slug}
            href={`/glossaire/${t.slug}`}
            className="rounded-lg border border-line bg-panel p-4 transition-colors hover:bg-panel-2"
          >
            <div className="font-semibold text-white hover:text-accent">{t.term}</div>
            <div className="mt-1 text-sm text-gray-400">{t.short}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
