import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kryptovue.fr"),
  title: {
    default: "KryptoVue — Cours crypto en temps réel & actus FR",
    template: "%s — KryptoVue",
  },
  description:
    "Suivez les cours des cryptomonnaies en temps réel, avec graphiques, heatmap du marché et actualités francophones. Sans inscription.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-brand">
              Krypto<span className="text-gray-900">Vue</span>
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Link href="/" className="hover:text-brand">
                Cours
              </Link>
              <Link href="/heatmap" className="hover:text-brand">
                Heatmap
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-gray-400">
          KryptoVue — informations à but éducatif uniquement, aucun conseil en
          investissement. Données de marché : Binance.
        </footer>
      </body>
    </html>
  );
}
