import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kryptovue.fr"),
  title: {
    default: "KryptoVue — Terminal crypto francophone temps réel",
    template: "%s — KryptoVue",
  },
  description:
    "Terminal d'analyse crypto francophone : cours en temps réel, graphiques, heatmap et sentiment du marché. Sans inscription.",
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold tracking-widest">
      <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs text-bg">
        ◆
      </span>
      <span className="text-sm text-white">
        KRYPTO<span className="text-accent">VUE</span>
      </span>
    </Link>
  );
}

const NAV = [
  { href: "/", label: "MARCHÉS" },
  { href: "/heatmap", label: "HEATMAP" },
  { href: "/alertes", label: "ALERTES" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Logo />
            <div className="ml-auto flex items-center gap-1 text-[11px] tracking-widest text-gray-500">
              {NAV.map((n, i) => (
                <Link
                  key={i}
                  href={n.href}
                  className="rounded px-3 py-1.5 hover:bg-line hover:text-accent"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="mt-16 border-t border-line">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 text-xs sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <Logo />
              <p className="mt-3 text-gray-500">
                {"// terminal d'analyse crypto francophone."}
                <br />
                {"// données de marché en temps réel."}
              </p>
            </div>
            <FooterCol
              title="ECOSYSTEM"
              links={["Marchés", "Heatmap", "Actus FR", "Sentiment IA"]}
            />
            <FooterCol
              title="RESOURCES"
              links={[
                { label: "Glossaire", href: "/glossaire" },
                { label: "Guides", href: "/guides" },
                { label: "Alertes", href: "/alertes" },
                { label: "Heatmap", href: "/heatmap" },
              ]}
            />
            <FooterCol
              title="LEGAL"
              links={["Mentions légales", "Confidentialité", "Conditions", "Avertissement AMF"]}
            />
          </div>
          <div className="border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-[11px] tracking-wide text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <span>© 2026 KRYPTOVUE // INFORMATIONNEL — AUCUN CONSEIL EN INVESTISSEMENT</span>
              <span className="text-accent/70">DATA_FEED :: BINANCE</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

type FooterLink = string | { label: string; href: string };

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <div className="text-[11px] tracking-widest text-accent/60">{title}</div>
      <ul className="mt-3 space-y-2 text-gray-400">
        {links.map((l) => {
          const label = typeof l === "string" ? l : l.label;
          const href = typeof l === "string" ? null : l.href;
          return (
            <li key={label}>
              {href ? (
                <Link href={href} className="hover:text-accent">
                  {label}
                </Link>
              ) : (
                <span className="cursor-default hover:text-accent">{label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
