import { formatChange } from "@/lib/format";

export function ChangeBadge({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium tabular-nums ${
        positive
          ? "bg-up/10 text-up ring-1 ring-up/20"
          : "bg-down/10 text-down ring-1 ring-down/20"
      }`}
    >
      {positive ? "▲" : "▼"} {formatChange(pct)}
    </span>
  );
}
