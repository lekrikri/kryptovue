// Formatage adapté aux prix crypto (grands et petits ordres de grandeur).
export function formatPrice(value: number): string {
  const digits = value >= 1000 ? 2 : value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatChange(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)} %`;
}

// Variation en % entre l'ouverture de la première bougie et le dernier prix.
export function changePercent(open: number, close: number): number {
  if (!open) return 0;
  return ((close - open) / open) * 100;
}

// Format compact pour grandes valeurs USD : 2.24T $, 220.4B $, 8.4M $.
export function formatCompactUSD(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(2)}T $`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B $`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M $`;
  return `${value.toFixed(0)} $`;
}

export type Currency = "usd" | "eur";

// Prix converti et formaté dans la devise choisie (valeurs sources en USD).
export function formatMoney(value: number, currency: Currency, rate: number): string {
  const v = currency === "eur" ? value * rate : value;
  const digits = v >= 1000 ? 2 : v >= 1 ? 2 : v >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency === "eur" ? "EUR" : "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);
}

export function formatCompact(value: number, currency: Currency, rate: number): string {
  const v = currency === "eur" ? value * rate : value;
  const sym = currency === "eur" ? "€" : "$";
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${(v / 1e12).toFixed(2)}T ${sym}`;
  if (abs >= 1e9) return `${(v / 1e9).toFixed(1)}B ${sym}`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(1)}M ${sym}`;
  return `${v.toFixed(0)} ${sym}`;
}
