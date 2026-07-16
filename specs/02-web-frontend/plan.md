# Plan 02 — Front web

## Stack
- **Next.js 15 (App Router) + React 19 + TypeScript strict** — SSR/ISR pour le SEO.
- **Tailwind CSS 3** — thème « fintech clair » (fond clair, pas de dark agressif — reco UX
  du benchmark), lisible pour des débutants.
- **lightweight-charts** (TradingView, gratuit) — bougies performantes.
- Aucune lib d'état lourde : Server Components pour les données initiales, quelques
  Client Components pour le live.

## Arborescence
```
web/
  app/
    layout.tsx, globals.css
    page.tsx                → accueil (SSR prix + live SSE)
    prix/[coin]/page.tsx    → page SEO par crypto (SSR + chart)
    heatmap/page.tsx        → heatmap marché
  components/  PriceTable, CandlestickChart, Heatmap, ChangeBadge
  hooks/       useTradeStream (SSE)
  lib/         api.ts (fetch API Go), coins.ts (registre symbole→nom), format.ts, types.ts
```

## Décisions
- **Deux base URLs** : `API_URL` (server-side, ex `http://api:8080` en prod) et
  `NEXT_PUBLIC_API_URL` (navigateur, pour le SSE). Défauts dev : `http://localhost:8081`.
- **Registre de cryptos** (`coins.ts`) : mappe le symbole Binance (`btcusdt`) vers un slug
  SEO (`bitcoin`), un nom et un ticker. Sert `generateStaticParams` et les métadonnées.
- **SSE côté client** : `useTradeStream` ouvre `EventSource` sur `/api/v1/stream`, met à
  jour une map symbole→prix ; reconnexion native d'EventSource.
- **SSR + hydratation** : la page crypto rend le prix et les bougies côté serveur (SEO),
  le graphique est monté côté client (lightweight-charts nécessite le DOM).
- **ISR** : `revalidate` court sur les pages crypto (le live prend le relais via SSE).

## CI
Job `web` : `pnpm install`, `pnpm typecheck` (tsc --noEmit), `pnpm build`.
