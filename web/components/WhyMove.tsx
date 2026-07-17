"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

// WhyMove interroge l'IA (Qwen) pour expliquer le mouvement récent à partir des
// actualités. Chargé côté client pour ne pas ralentir le rendu serveur.
export function WhyMove({ symbol }: { symbol: string }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`${API}/api/v1/why/${symbol}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((b) => {
        if (alive) setText(b.data?.explanation ?? null);
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [symbol]);

  if (failed) return null; // IA indisponible : on masque simplement le bloc

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold tracking-widest text-white">
        WHY_MOVE :: AI_EXPLAIN
      </h2>
      <div className="rounded-lg border border-accent/30 bg-panel p-5">
        {loading ? (
          <p className="text-sm text-gray-500">
            {"// analyse des actualités par l'IA…"}
          </p>
        ) : (
          <p className="text-[15px] leading-relaxed text-gray-300">{text}</p>
        )}
        <p className="mt-2 text-[11px] tracking-wide text-gray-600">
          {"// généré par IA à partir des actus FR — à but éducatif, aucun conseil"}
        </p>
      </div>
    </section>
  );
}
