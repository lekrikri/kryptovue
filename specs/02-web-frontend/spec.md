# Spec 02 — Front web (Next.js)

## Pourquoi
Le SEO programmatique est le canal d'acquisition n°1 (consensus du benchmark IA). Il faut
un front web-first : des pages indexables par crypto qui affichent prix + graphique, plus
un tableau de bord temps réel. Web d'abord, Flutter plus tard (constitution §Produit).

## User stories
- **US-1** : en tant que visiteur arrivant par Google sur « cours du bitcoin », je vois une
  page `/prix/bitcoin` rendue côté serveur (SEO) avec le prix, le graphique en bougies et
  les métadonnées, sans avoir à me connecter.
- **US-2** : en tant que visiteur sur l'accueil, je vois le top des cryptos avec des prix
  qui se mettent à jour en direct (SSE) sans rafraîchir.
- **US-3** : en tant que visiteur, je vois une heatmap du marché (variation par actif) d'un
  coup d'œil.
- **US-4** : en tant que moteur de recherche, je reçois un HTML complet (title, meta
  description, JSON-LD) pour chaque page crypto.

## Critères d'acceptation
- [ ] `/prix/[coin]` rendue en SSR, `generateMetadata` par crypto, JSON-LD présent
- [ ] Accueil : prix initiaux en SSR puis mise à jour live via SSE
- [ ] Graphique en bougies (candlestick) alimenté par `/api/v1/candles`
- [ ] Zéro inscription requise pour consulter (constitution §3)
- [ ] `next build` vert, typecheck strict, ajouté à la CI

## Hors scope (phases suivantes)
Auth, alertes, sentiment IA, news — traités en Phases 3/4.
