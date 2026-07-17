import type { MetadataRoute } from "next";
import { COINS } from "@/lib/coins";
import { GLOSSARY } from "@/lib/glossary";
import { GUIDES } from "@/lib/guides";

const BASE = "https://kryptovue.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ["", "/heatmap", "/alertes", "/glossaire", "/guides"].map(
    (p) => ({ url: `${BASE}${p}`, lastModified: now }),
  );
  const coinPages = COINS.map((c) => ({
    url: `${BASE}/prix/${c.slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));
  const glossaryPages = GLOSSARY.map((t) => ({
    url: `${BASE}/glossaire/${t.slug}`,
    lastModified: now,
  }));
  const guidePages = GUIDES.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: now,
  }));
  return [...staticPages, ...coinPages, ...glossaryPages, ...guidePages];
}
