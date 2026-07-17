// Glossaire crypto FR — chaque terme génère une page SEO /glossaire/[slug].
export interface Term {
  slug: string;
  term: string;
  short: string; // définition courte (meta description)
  body: string; // définition longue (contenu)
}

export const GLOSSARY: Term[] = [
  {
    slug: "bitcoin",
    term: "Bitcoin (BTC)",
    short: "La première cryptomonnaie, créée en 2009, décentralisée et à offre limitée à 21 millions d'unités.",
    body: "Le Bitcoin est la première cryptomonnaie, lancée en 2009 par une entité pseudonyme, Satoshi Nakamoto. Il fonctionne sur une blockchain publique et décentralisée, sans banque centrale. Son offre est plafonnée à 21 millions d'unités, ce qui en fait un actif dit « déflationniste ». On le désigne souvent comme « l'or numérique ».",
  },
  {
    slug: "blockchain",
    term: "Blockchain",
    short: "Registre numérique distribué et infalsifiable qui enregistre les transactions par blocs chaînés.",
    body: "Une blockchain est un registre distribué qui enregistre des transactions dans des blocs reliés cryptographiquement. Chaque nouveau bloc référence le précédent, rendant l'historique quasi impossible à falsifier. La blockchain est maintenue par un réseau d'ordinateurs (nœuds) plutôt que par une autorité centrale.",
  },
  {
    slug: "halving",
    term: "Halving",
    short: "Division par deux de la récompense des mineurs de Bitcoin, environ tous les 4 ans.",
    body: "Le halving est un événement programmé de la blockchain Bitcoin qui divise par deux la récompense attribuée aux mineurs pour chaque bloc validé, environ tous les quatre ans. Il réduit le rythme de création de nouveaux bitcoins, renforçant la rareté de l'actif.",
  },
  {
    slug: "staking",
    term: "Staking",
    short: "Immobiliser des cryptos pour sécuriser un réseau proof-of-stake et recevoir des récompenses.",
    body: "Le staking consiste à immobiliser (« bloquer ») des cryptomonnaies pour participer à la validation des transactions d'un réseau fonctionnant en preuve d'enjeu (proof-of-stake). En échange, les participants reçoivent des récompenses. C'est l'équivalent, côté proof-of-stake, du minage en proof-of-work.",
  },
  {
    slug: "proof-of-stake",
    term: "Proof-of-Stake (PoS)",
    short: "Mécanisme de consensus où les validateurs sont choisis selon les cryptos qu'ils immobilisent.",
    body: "La preuve d'enjeu (proof-of-stake) est un mécanisme de consensus dans lequel les validateurs sont sélectionnés en fonction de la quantité de cryptomonnaie qu'ils immobilisent. Bien moins énergivore que la preuve de travail (proof-of-work), elle est utilisée par Ethereum depuis 2022.",
  },
  {
    slug: "defi",
    term: "DeFi (finance décentralisée)",
    short: "Services financiers (prêt, échange, épargne) sans intermédiaire, via des contrats intelligents.",
    body: "La finance décentralisée (DeFi) regroupe des services financiers — prêt, emprunt, échange, épargne — fonctionnant sans intermédiaire grâce à des contrats intelligents sur une blockchain. Les utilisateurs conservent le contrôle de leurs fonds, mais s'exposent à des risques techniques et de marché.",
  },
  {
    slug: "wallet",
    term: "Wallet (portefeuille)",
    short: "Outil qui stocke les clés permettant d'accéder à ses cryptomonnaies et de signer des transactions.",
    body: "Un wallet (portefeuille crypto) est un outil logiciel ou matériel qui conserve les clés cryptographiques donnant accès à vos cryptomonnaies. Un portefeuille « chaud » est connecté à Internet ; un portefeuille « froid » (hardware wallet) reste hors ligne, plus sûr pour la conservation longue durée.",
  },
  {
    slug: "market-cap",
    term: "Capitalisation (market cap)",
    short: "Valeur totale d'une cryptomonnaie : prix multiplié par le nombre d'unités en circulation.",
    body: "La capitalisation boursière (market cap) d'une cryptomonnaie correspond à son prix multiplié par le nombre d'unités en circulation. C'est un indicateur de taille : une capitalisation élevée traduit généralement un actif plus établi et moins volatil qu'un actif à faible capitalisation.",
  },
  {
    slug: "volatilite",
    term: "Volatilité",
    short: "Ampleur des variations de prix d'un actif sur une période : plus elle est forte, plus le prix bouge.",
    body: "La volatilité mesure l'ampleur des variations de prix d'un actif sur une période donnée. Une volatilité élevée signifie des mouvements de prix importants, à la hausse comme à la baisse. Les cryptomonnaies sont réputées très volatiles comparées aux actifs traditionnels.",
  },
  {
    slug: "stablecoin",
    term: "Stablecoin",
    short: "Cryptomonnaie dont la valeur est arrimée à un actif stable, souvent le dollar ou l'euro.",
    body: "Un stablecoin est une cryptomonnaie conçue pour maintenir une valeur stable, généralement arrimée à une monnaie comme le dollar (USDT, USDC) ou l'euro. Il sert de refuge face à la volatilité et de moyen d'échange au sein de l'écosystème crypto.",
  },
];

const bySlug = new Map(GLOSSARY.map((t) => [t.slug, t]));
export const termBySlug = (slug: string) => bySlug.get(slug);
