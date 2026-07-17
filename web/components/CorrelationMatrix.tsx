import { coinBySymbol } from "@/lib/coins";
import type { Correlations } from "@/lib/types";

// Couleur d'une cellule selon la corrélation (-1 rouge → 0 gris → +1 vert).
function cellColor(v: number): string {
  if (v >= 0) return `rgba(52, 211, 153, ${0.12 + v * 0.55})`;
  return `rgba(248, 113, 113, ${0.12 + Math.abs(v) * 0.55})`;
}

export function CorrelationMatrix({ data }: { data: Correlations }) {
  const tickers = data.symbols.map((s) => coinBySymbol(s)?.ticker ?? s.toUpperCase());

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-panel p-3">
      <table className="w-full border-collapse text-center text-[11px]">
        <thead>
          <tr>
            <th className="p-1.5" />
            {tickers.map((t) => (
              <th key={t} className="p-1.5 font-medium tracking-wider text-gray-500">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.matrix.map((row, i) => (
            <tr key={i}>
              <td className="p-1.5 text-right font-medium tracking-wider text-gray-500">
                {tickers[i]}
              </td>
              {row.map((v, j) => (
                <td
                  key={j}
                  className="p-1.5 font-mono tabular-nums text-gray-200"
                  style={{ backgroundColor: cellColor(v) }}
                  title={`${tickers[i]} / ${tickers[j]} : ${v.toFixed(2)}`}
                >
                  {v.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
