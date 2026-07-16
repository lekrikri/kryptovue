import { coinBySymbol } from "@/lib/coins";
import type { News } from "@/lib/types";

const LABEL_STYLE: Record<News["sentiment_label"], string> = {
  positive: "bg-up/10 text-up ring-up/20",
  negative: "bg-down/10 text-down ring-down/20",
  neutral: "bg-white/5 text-gray-400 ring-white/10",
};

const LABEL_TEXT: Record<News["sentiment_label"], string> = {
  positive: "POSITIF",
  negative: "NÉGATIF",
  neutral: "NEUTRE",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

export function NewsFeed({ news }: { news: News[] }) {
  if (news.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-panel p-6 text-sm text-gray-500">
        {"// aucune actualité analysée pour le moment"}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line/60 overflow-hidden rounded-lg border border-line bg-panel">
      {news.map((n) => (
        <li key={n.id} className="p-4 transition-colors hover:bg-panel-2">
          <a href={n.url} target="_blank" rel="noopener noreferrer" className="block">
            <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
              <span
                className={`rounded px-1.5 py-0.5 font-medium ring-1 ${LABEL_STYLE[n.sentiment_label]}`}
              >
                {LABEL_TEXT[n.sentiment_label]}
              </span>
              <span>{n.source}</span>
              <span>·</span>
              <span>{timeAgo(n.published_at)}</span>
            </div>
            <div className="text-sm text-gray-200 hover:text-accent">{n.title}</div>
            {n.coins.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {n.coins.map((c) => (
                  <span
                    key={c}
                    className="rounded border border-line px-1.5 py-0.5 text-[10px] tracking-wider text-gray-400"
                  >
                    {coinBySymbol(c)?.ticker ?? c}
                  </span>
                ))}
              </div>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
