"use client";

import { useEffect, useState } from "react";
import type { Indicators } from "@/lib/types";
import { IndicatorsPanel } from "@/components/IndicatorsPanel";

// TechScan enveloppe les indicateurs avec un « mode débutant » qui remplace les
// indicateurs techniques par une lecture en langage clair (préférence mémorisée).
export function TechScan({ ind }: { ind: Indicators }) {
  const [beginner, setBeginner] = useState(false);

  useEffect(() => {
    setBeginner(localStorage.getItem("kv_beginner") === "1");
  }, []);

  function toggle() {
    const next = !beginner;
    setBeginner(next);
    localStorage.setItem("kv_beginner", next ? "1" : "0");
  }

  const trend = ind.macd_hist >= 0 ? "plutôt haussière" : "plutôt baissière";
  const vol =
    ind.volatility < 0.3 ? "faible" : ind.volatility < 0.8 ? "modérée" : "élevée";
  const rsiWord =
    ind.rsi_zone === "surachat"
      ? "le prix a beaucoup monté récemment (zone de surachat)"
      : ind.rsi_zone === "survente"
        ? "le prix a beaucoup baissé récemment (zone de survente)"
        : "le prix est dans une zone neutre";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-widest text-white">
          {beginner ? "ANALYSE :: MODE DÉBUTANT" : "INDICATORS :: TECH_SCAN"}
        </h2>
        <button
          onClick={toggle}
          className="rounded border border-line px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:border-accent hover:text-accent"
        >
          {beginner ? "Mode expert" : "Mode débutant"}
        </button>
      </div>

      {beginner ? (
        <div className="space-y-2 rounded-lg border border-line bg-panel p-5 text-[15px] leading-relaxed text-gray-300">
          <p>
            La tendance récente est <strong className="text-white">{trend}</strong>,
            avec une volatilité <strong className="text-white">{vol}</strong>.
          </p>
          <p>En clair : {rsiWord}.</p>
          {ind.anomaly && (
            <p className="text-down">⚠ {ind.anomaly_note}</p>
          )}
          <p className="text-[12px] text-gray-500">
            {"// lecture simplifiée — à but éducatif, aucun conseil d'investissement"}
          </p>
        </div>
      ) : (
        <IndicatorsPanel ind={ind} />
      )}
    </section>
  );
}
