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
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 text-sm text-white">
                K
              </span>
              <span>
                <span className="text-brand">Krypto</span>
                <span className="text-gray-900">Vue</span>
              </span>
            </Link>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
              <Link href="/" className="rounded-lg px-3 py-1.5 hover:bg-gray-100 hover:text-brand">
                Cours
              </Link>
              <Link
                href="/heatmap"
                className="rounded-lg px-3 py-1.5 hover:bg-gray-100 hover:text-brand"
              >
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
