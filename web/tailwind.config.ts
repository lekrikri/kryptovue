import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        up: "#16a34a",
        down: "#dc2626",
        brand: "#0f766e",
      },
    },
  },
  plugins: [],
};

export default config;
