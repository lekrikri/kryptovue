# KryptoVue — Constitution du projet

> Principes non négociables. Toute spec, tout plan, toute PR doit s'y conformer.

## Produit
1. **Positionnement** : veille crypto francophone augmentée par l'IA. Pas un clone de
   CoinMarketCap — on gagne sur les news FR, la vulgarisation et les alertes intelligentes.
2. **Strictement informationnel** (AMF/MiCA) : jamais de "acheter/vendre/opportunité",
   disclaimers visibles, sources toujours citées.
3. **Zéro inscription pour consulter.** Un compte n'est requis que pour les alertes/portfolio.

## Technique
4. **Go pour les services** (ingestion, agrégation, API, alertes). Python uniquement pour
   le worker IA. Pas de troisième langage backend.
5. **Une seule base** : PostgreSQL + TimescaleDB + pgvector. Pas de datastore additionnel
   sans justification chiffrée.
6. **Redpanda** comme broker (API Kafka, client franz-go). Mode dev 1 core / 1 Go.
7. **SSE** pour le temps réel vers les clients (pas de WebSocket côté front).
8. **Pas de composant décoratif** : chaque brique doit se justifier par le volume réel.
   (Spark a été supprimé pour cette raison — ne pas réintroduire d'équivalent.)
9. Tout tourne sur **un VPS Hetzner CX32 (8 Go)** via Docker Compose. Kubernetes interdit
   avant preuve de nécessité.

## Qualité
10. **Tests obligatoires** sur la logique métier (agrégation candles, parsing, alertes).
    CI GitHub Actions verte ou pas de merge sur `main`.
11. **Conventional commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
12. Config par variables d'environnement, jamais de secret ni d'URL en dur dans le code.
13. Chaque phase livre un artefact **démontrable** (démo visible), sinon elle n'est pas finie.

## Méthode (spec kit)
14. Chaque phase = `specs/NN-nom/` contenant `spec.md` (quoi/pourquoi, user stories),
    `plan.md` (comment, choix techniques), `tasks.md` (découpage exécutable, cochable).
15. Les décisions d'architecture sont tracées (audit, benchmark IA, ADR dans les plans).
