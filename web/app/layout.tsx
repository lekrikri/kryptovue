import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kryptovue.fr"),
  title: {
    default: "KryptoVue — Le radar crypto francophone en temps réel",
    template: "%s — KryptoVue",
  },
  description:
    "Terminal d'analyse crypto francophone : cours en temps réel, graphiques, heatmap et sentiment du marché. Sans inscription.",
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm text-terminal">
        K
      </span>
      <span className="text-white">
        Krypto<span className="text-brand">Vue</span>
      </span>
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-terminal/95 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
            <Logo />
            <div className="ml-2 hidden items-center gap-1 text-sm text-white/60 md:flex">
              <Link href="/" className="rounded-lg px-3 py-1.5 hover:bg-white/10 hover:text-white">
                Marché
              </Link>
              <Link href="/heatmap" className="rounded-lg px-3 py-1.5 hover:bg-white/10 hover:text-white">
                Heatmap
              </Link>
            </div>
            <div className="ml-auto hidden flex-1 items-center sm:flex sm:max-w-xs">
              <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/40">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeWidth="2" d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                </svg>
                <span>Rechercher un actif…</span>
              </div>
            </div>
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600" />
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="mt-16 bg-terminal text-white/70">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <Logo />
              <p className="mt-3 text-sm text-white/50">
                Terminal d&apos;analyse crypto francophone. Données de marché en
                temps réel. Interface pensée pour la clarté.
              </p>
            </div>
            <FooterCol
              title="Écosystème"
              links={["Cours du marché", "Heatmap", "Actualités FR", "Sentiment IA"]}
            />
            <FooterCol
              title="Ressources"
              links={["Glossaire", "Guides débutant", "Statut système", "API"]}
            />
            <FooterCol
              title="Cadre légal"
              links={["Mentions légales", "Confidentialité", "Conditions", "Avertissement AMF"]}
            />
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
              <span>© 2026 KryptoVue — informations à but éducatif, aucun conseil en investissement.</span>
              <span>Données de marché : Binance</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l}>
            <span className="cursor-default hover:text-white">{l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
