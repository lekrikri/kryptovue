# Tasks 02 — Front web

- [x] T1. Scaffolding Next.js 15 + TS strict + Tailwind 3 dans `web/`
- [x] T2. `lib/` : types, registre coins, helpers format, client API Go
- [x] T3. `hooks/useTradeStream` — SSE EventSource → prix live
- [x] T4. `components/` : ChangeBadge, PriceTable (live), CandlestickChart, Heatmap
- [x] T5. `app/layout.tsx` + `globals.css` (thème clair) + nav
- [x] T6. `app/page.tsx` — accueil SSR + live
- [x] T7. `app/prix/[coin]/page.tsx` — SSR, generateMetadata, JSON-LD, chart
- [x] T8. `app/heatmap/page.tsx`
- [x] T9. `next build` + typecheck verts
- [x] T10. CI : job web ; README mis à jour

## Résultat de validation (2026-07-16)

Chaîne complète validée en local (Binance → Go → TimescaleDB → API → Next SSR) :
- `next build` : 15 pages générées (accueil, heatmap, 10 pages crypto SSG/ISR).
- Page `/prix/bitcoin` rendue côté serveur : titre SEO, prix réel (ex. 64 713,99 $US),
  JSON-LD `FinancialProduct`, `canonical`.
- Accueil : prix initiaux SSR (BTC/ETH/SOL/XRP…) + mise à jour live via SSE côté client.
- Responsive mobile-first (Tailwind).

## Reste à faire (Phase 2.5)
- [ ] Dockeriser le front (Dockerfile web) + l'ajouter à la stack prod + reverse proxy
- [ ] Pages éditoriales SEO (glossaire, guides) — voir benchmark IA
- [ ] Sparklines dans le tableau des prix
