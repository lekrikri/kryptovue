import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KryptoVue — Terminal crypto FR",
    short_name: "KryptoVue",
    description:
      "Terminal d'analyse crypto francophone : cours temps réel, sentiment, alertes.",
    start_url: "/",
    display: "standalone",
    background_color: "#080b11",
    theme_color: "#080b11",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
