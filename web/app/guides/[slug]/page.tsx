import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, guideBySlug } from "@/lib/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return { title: "Guide introuvable" };
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    url: `https://kryptovue.fr/guides/${g.slug}`,
  };

  return (
    <article className="space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-[11px] tracking-widest text-gray-500">
        <Link href="/guides" className="hover:text-accent">
          GUIDES
        </Link>
      </nav>
      <h1 className="max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl">
        {g.title}
      </h1>
      <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-gray-300">
        {g.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="rounded-lg border border-line bg-panel p-4 text-sm text-gray-400">
        {"// Information à but éducatif, aucun conseil en investissement."}
      </div>
    </article>
  );
}
