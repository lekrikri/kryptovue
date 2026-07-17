import type { Indicators } from "@/lib/types";

const ZONE_COLOR: Record<Indicators["rsi_zone"], string> = {
  surachat: "text-down",
  survente: "text-up",
  neutre: "text-gray-300",
};

function Cell({
  label,
  value,
  hint,
  color = "text-white",
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel-2 p-3">
      <div className="text-[10px] uppercase tracking-widest text-gray-500">
        {label}
      </div>
      <div className={`mt-1 text-lg font-bold tabular-nums ${color}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[10px] tracking-wide text-gray-500">{hint}</div>}
    </div>
  );
}

export function IndicatorsPanel({ ind }: { ind: Indicators }) {
  const macdColor = ind.macd_hist >= 0 ? "text-up" : "text-down";
  return (
    <div className="space-y-3">
      {ind.anomaly && (
        <div className="flex items-center gap-2 rounded-lg border border-down/40 bg-down/10 px-4 py-2.5 text-sm text-down">
          <span aria-hidden>⚠</span>
          <span className="uppercase tracking-wider">ANOMALY_DETECTED ::</span>
          <span className="text-gray-200">{ind.anomaly_note}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Cell
          label="RSI_14"
          value={ind.rsi.toFixed(1)}
          hint={ind.rsi_zone}
          color={ZONE_COLOR[ind.rsi_zone]}
        />
        <Cell
          label="MACD_HIST"
          value={ind.macd_hist.toFixed(2)}
          hint={ind.macd_hist >= 0 ? "momentum +" : "momentum −"}
          color={macdColor}
        />
        <Cell label="SMA_20" value={ind.sma20.toLocaleString("fr-FR")} />
        <Cell label="EMA_50" value={ind.ema50.toLocaleString("fr-FR")} />
        <Cell label="VOLAT_%" value={`${ind.volatility.toFixed(2)}`} hint="σ rendements" />
        <Cell
          label="VOL_Z"
          value={`${ind.volume_zscore.toFixed(1)}σ`}
          hint="vs normale"
          color={Math.abs(ind.volume_zscore) >= 3 ? "text-down" : "text-white"}
        />
      </div>
      <p className="text-[11px] tracking-wide text-gray-600">
        {"// indicateurs descriptifs sur "}
        {ind.points}
        {" bougies — à but éducatif, aucun conseil d'investissement"}
      </p>
    </div>
  );
}
