"use client";

import { useEffect, useState } from "react";

// Taux USD→EUR (via le prix EUR du Tether ≈ 1 $). Récupéré une fois côté client.
// CoinGecko autorise le CORS. Repli 0.92 si indisponible.
export function useEurRate(): number {
  const [rate, setRate] = useState(0.92);

  useEffect(() => {
    let alive = true;
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=eur")
      .then((r) => r.json())
      .then((d) => {
        const v = d?.tether?.eur;
        if (alive && typeof v === "number" && v > 0) setRate(v);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return rate;
}
