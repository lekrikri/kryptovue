import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GLOSSARY, termBySlug } from "@/lib/glossary";

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term: slug } = await params;
  const t = termBySlug(slug);
  if (!t) return { title: "Terme introuvable" };
  return {
    title: `${t.term} — définition`,
    description: t.short,
    alternates: { canonical: `/glossaire/${t.slug}` },
  };
}

export default async function TermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: slug } = await params;
  const t = termBySlug(slug);
  if (!t) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: t.term,
    description: t.short,
    inDefinedTermSet: "https://kryptovue.fr/glossaire",
  };

  return (
    <article className="space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-[11px] tracking-widest text-gray-500">
        <Link href="/glossaire" className="hover:text-accent">
          GLOSSAIRE
        </Link>{" "}
        / <span className="text-gray-300">{t.slug.toUpperCase()}</span>
      </nav>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">{t.term}</h1>
      <p className="max-w-2xl text-[15px] leading-relaxed text-gray-300">{t.body}</p>
      <div className="rounded-lg border border-line bg-panel p-4 text-sm text-gray-400">
        {"// Information à but éducatif, aucun conseil en investissement."}
      </div>
    </article>
  );
}
