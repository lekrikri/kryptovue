"use client";

import { useEffect, useState, useCallback } from "react";
import { COINS } from "@/lib/coins";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

interface Alert {
  id: number;
  symbol: string;
  rule_type: string;
  threshold: number;
}

const RULE_LABELS: Record<string, string> = {
  price_above: "Prix au-dessus de",
  price_below: "Prix en-dessous de",
  change_above: "Variation 24h ≥ (%)",
  anomaly: "Mouvement/volume anormal",
};

export default function AlertesPage() {
  const [chatId, setChatId] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [symbol, setSymbol] = useState(COINS[0].symbol);
  const [ruleType, setRuleType] = useState("price_below");
  const [threshold, setThreshold] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("kv_chat_id");
    if (saved) setChatId(saved);
  }, []);

  const load = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`${API}/api/v1/alerts?target=${encodeURIComponent(id)}`);
      const body = await res.json();
      setAlerts(body.data ?? []);
    } catch {
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    if (chatId) load(chatId);
  }, [chatId, load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!chatId) {
      setMsg("Renseigne d'abord ton identifiant Telegram.");
      return;
    }
    localStorage.setItem("kv_chat_id", chatId);
    const res = await fetch(`${API}/api/v1/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_type: "telegram",
        target_addr: chatId,
        symbol,
        rule_type: ruleType,
        threshold: parseFloat(threshold || "0"),
      }),
    });
    if (res.ok) {
      setThreshold("");
      setMsg("Alerte créée ✓");
      load(chatId);
    } else {
      setMsg("Erreur : vérifie les champs.");
    }
  }

  async function remove(id: number) {
    await fetch(`${API}/api/v1/alerts/${id}?target=${encodeURIComponent(chatId)}`, {
      method: "DELETE",
    });
    load(chatId);
  }

  const needsThreshold = ruleType !== "anomaly";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-panel p-6">
        <div className="text-[11px] tracking-widest text-accent">
          {"// ALERT_ENGINE :: TELEGRAM"}
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
          Alertes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          Reçois une notification Telegram quand une condition de marché est
          remplie (prix, variation, ou mouvement anormal détecté par nos algos).
          Informations à but éducatif — aucun conseil d&apos;investissement.
        </p>
      </section>

      <section className="rounded-xl border border-line bg-panel p-6">
        <label className="text-[11px] tracking-widest text-gray-500">
          IDENTIFIANT TELEGRAM (chat_id)
        </label>
        <input
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="ex : 123456789"
          className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
        <p className="mt-1 text-[11px] text-gray-600">
          {"// obtiens ton chat_id en écrivant à @userinfobot sur Telegram"}
        </p>

        <form onSubmit={create} className="mt-5 grid gap-3 sm:grid-cols-4">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            {COINS.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.name} ({c.ticker})
              </option>
            ))}
          </select>
          <select
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value)}
            className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            {Object.entries(RULE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="any"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            disabled={!needsThreshold}
            placeholder={needsThreshold ? "seuil" : "—"}
            className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-white outline-none focus:border-accent disabled:opacity-40"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-xs font-bold uppercase tracking-widest text-bg hover:bg-teal-300"
          >
            Créer
          </button>
        </form>
        {msg && <p className="mt-3 text-sm text-accent">{msg}</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold tracking-widest text-white">
          MES_ALERTES ({alerts.length})
        </h2>
        {alerts.length === 0 ? (
          <div className="rounded-lg border border-line bg-panel p-6 text-sm text-gray-500">
            {"// aucune alerte — crée-en une ci-dessus"}
          </div>
        ) : (
          <ul className="divide-y divide-line/60 overflow-hidden rounded-lg border border-line bg-panel">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-center justify-between p-4">
                <span className="text-sm text-gray-200">
                  <span className="font-semibold text-white">
                    {a.symbol.replace("usdt", "").toUpperCase()}
                  </span>{" "}
                  · {RULE_LABELS[a.rule_type] ?? a.rule_type}
                  {a.rule_type !== "anomaly" && ` ${a.threshold}`}
                </span>
                <button
                  onClick={() => remove(a.id)}
                  className="text-xs uppercase tracking-widest text-gray-500 hover:text-down"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
