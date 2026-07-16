import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        up: "#16a34a",
        down: "#ef4444",
        brand: "#10b981",
        "brand-dark": "#059669",
        terminal: "#0b1220",
        "terminal-soft": "#111a2e",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
