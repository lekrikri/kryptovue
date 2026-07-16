// Jauge de sentiment façon "Fear & Greed", calculée à partir de la proportion
// de cryptos en hausse (métrique réelle dérivée, pas de donnée inventée).
export function sentimentLabel(value: number): string {
  if (value >= 75) return "Euphorie";
  if (value >= 60) return "Optimiste";
  if (value >= 45) return "Neutre";
  if (value >= 25) return "Prudent";
  return "Peur";
}

export function SentimentGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const color = v >= 60 ? "#10b981" : v >= 45 ? "#eab308" : "#ef4444";
  const radius = 34;
  const circ = 2 * Math.PI * radius;
  const dash = (v / 100) * circ;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[84px] w-[84px]">
        <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
          <circle cx="42" cy="42" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xl font-bold text-white">{v}</span>
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-white/50">
          Sentiment marché
        </div>
        <div className="text-lg font-semibold" style={{ color }}>
          {sentimentLabel(v)}
        </div>
      </div>
    </div>
  );
}
