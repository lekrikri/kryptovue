"use client";

import { useEffect, useState } from "react";
import type { Trade } from "@/lib/types";

const CLIENT_API =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

// useTradeStream ouvre une connexion SSE et maintient une map symbole → dernier prix.
// EventSource gère la reconnexion automatiquement.
export function useTradeStream(): Record<string, number> {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const source = new EventSource(`${CLIENT_API}/api/v1/stream`);

    source.addEventListener("trade", (event) => {
      try {
        const trade = JSON.parse((event as MessageEvent).data) as Trade;
        setPrices((prev) => {
          if (prev[trade.symbol] === trade.price) return prev;
          return { ...prev, [trade.symbol]: trade.price };
        });
      } catch {
        // message illisible : ignoré
      }
    });

    return () => source.close();
  }, []);

  return prices;
}
