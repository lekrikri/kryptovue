import { formatChange } from "@/lib/format";

export function ChangeBadge({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-sm font-medium ${
        positive ? "bg-green-50 text-up" : "bg-red-50 text-down"
      }`}
    >
      {positive ? "▲" : "▼"} {formatChange(pct)}
    </span>
  );
}
