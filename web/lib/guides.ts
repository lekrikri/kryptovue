// Guides débutant — pages SEO /guides/[slug].
export interface Guide {
  slug: string;
  title: string;
  description: string;
  paragraphs: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: "debuter-en-crypto",
    title: "Débuter en cryptomonnaie : le guide pour comprendre l'essentiel",
    description:
      "Les bases pour comprendre la cryptomonnaie sans jargon : blockchain, portefeuille, achat, et bonnes pratiques de sécurité.",
    paragraphs: [
      "La cryptomonnaie peut sembler intimidante au premier abord, mais quelques notions suffisent pour s'y retrouver. Une cryptomonnaie est un actif numérique qui circule sur une blockchain, un registre partagé et infalsifiable, sans passer par une banque.",
      "Pour détenir des cryptos, on utilise un portefeuille (wallet) qui conserve vos clés d'accès. Pour la conservation longue durée, un portefeuille matériel (hors ligne) est le plus sûr.",
      "Avant tout achat, informez-vous : la volatilité est forte et il ne faut investir que ce que l'on peut se permettre de perdre. Méfiez-vous des promesses de gains rapides et vérifiez que les plateformes sont enregistrées auprès de l'AMF en France.",
      "KryptoVue vous aide à suivre le marché et l'actualité francophone, mais ne fournit aucun conseil en investissement : les informations sont éducatives.",
    ],
  },
  {
    slug: "lire-un-graphique-en-bougies",
    title: "Comment lire un graphique en bougies (chandeliers japonais)",
    description:
      "Apprenez à lire un graphique en bougies : ouverture, clôture, plus haut, plus bas, et ce que révèlent les couleurs.",
    paragraphs: [
      "Un graphique en bougies (ou chandeliers japonais) résume l'évolution d'un prix sur des intervalles réguliers. Chaque bougie représente une période (1 minute, 1 heure, 1 jour…).",
      "Le corps de la bougie relie le prix d'ouverture au prix de clôture. Une bougie verte indique une clôture supérieure à l'ouverture (hausse) ; une bougie rouge, l'inverse (baisse).",
      "Les mèches (fines lignes au-dessus et en dessous du corps) marquent le plus haut et le plus bas atteints pendant la période. De longues mèches signalent une forte agitation.",
      "Lire une succession de bougies permet de visualiser une tendance, sans pour autant prédire l'avenir : aucun graphique ne garantit un mouvement futur.",
    ],
  },
  {
    slug: "comprendre-la-volatilite",
    title: "Comprendre la volatilité en crypto",
    description:
      "Pourquoi les cryptos bougent-elles autant ? Comprendre la volatilité et comment la relativiser.",
    paragraphs: [
      "La volatilité mesure l'ampleur des variations de prix. En crypto, elle est élevée : un actif peut varier de plusieurs pourcents en une journée, parfois en quelques heures.",
      "Plusieurs facteurs l'expliquent : un marché encore jeune, une liquidité variable, l'impact des actualités et des annonces réglementaires, et le comportement des investisseurs.",
      "Sur KryptoVue, l'indice « Bruit vs Signal » vous aide à distinguer une forte activité médiatique (le bruit) d'un véritable mouvement de prix (le signal).",
      "Une volatilité forte n'est ni bonne ni mauvaise en soi : c'est une caractéristique du marché qu'il faut connaître et intégrer.",
    ],
  },
];

const bySlug = new Map(GUIDES.map((g) => [g.slug, g]));
export const guideBySlug = (slug: string) => bySlug.get(slug);
