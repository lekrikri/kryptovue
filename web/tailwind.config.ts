import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        up: "#34d399",
        down: "#f87171",
        accent: "#2dd4bf", // teal terminal
        cyan: "#22d3ee",
        bg: "#080b11", // fond terminal
        panel: "#0c111b", // panneaux
        "panel-2": "#0f1622",
        line: "#1b2635", // bordures
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
