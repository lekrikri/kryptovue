// Jauge de sentiment façon "Fear & Greed", calculée depuis la proportion de
// cryptos en hausse (métrique réelle dérivée, pas de donnée inventée).
export function sentimentLabel(value: number): string {
  if (value >= 75) return "EUPHORIA_PROT";
  if (value >= 60) return "GREED_PROT";
  if (value >= 45) return "NEUTRAL_PROT";
  if (value >= 25) return "FEAR_PROT";
  return "PANIC_PROT";
}

export function SentimentGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const color = v >= 60 ? "#34d399" : v >= 45 ? "#eab308" : "#f87171";
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const dash = (v / 100) * circ;

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500">
          SENTIMENT_IDX
        </div>
        <div className="mt-1 text-lg font-bold tracking-wide" style={{ color }}>
          {sentimentLabel(v)} ({v})
        </div>
      </div>
      <div className="relative h-[60px] w-[60px] shrink-0">
        <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90">
          <circle cx="30" cy="30" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{v}</span>
        </div>
      </div>
    </div>
  );
}
