import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides crypto pour débutants",
  description:
    "Guides clairs et en français pour débuter en crypto : comprendre la blockchain, lire un graphique, appréhender la volatilité.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-panel px-6 py-8">
        <div className="text-[11px] tracking-widest text-accent">{"// GUIDES"}</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Guides pour débuter
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          {"> "}Comprendre la crypto pas à pas, sans jargon.
        </p>
      </section>
      <div className="grid gap-3">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="rounded-lg border border-line bg-panel p-5 transition-colors hover:bg-panel-2"
          >
            <div className="font-semibold text-white hover:text-accent">{g.title}</div>
            <div className="mt-1 text-sm text-gray-400">{g.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
