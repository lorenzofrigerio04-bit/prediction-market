"use client";

import Link from "next/link";

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  timeAgo?: string;
  href?: string;
  live?: boolean;
}

const FALLBACK_NEWS: NewsItem[] = [
  { id: "1", title: "Nuovo evento: Bitcoin sopra 100k entro fine anno?", category: "Economia", timeAgo: "2h", live: true },
  { id: "2", title: "Europei 2024: chi vincerà il gruppo Italia?", category: "Sport", timeAgo: "5h", live: true },
  { id: "3", title: "Elezioni USA 2024 — mercato delle previsioni aperto", category: "Politica", timeAgo: "1g", live: true },
  { id: "4", title: "Lancio Apple Intelligence: impatto su azioni AAPL", category: "Tecnologia", timeAgo: "3h", live: true },
  { id: "5", title: "Festival di Sanremo 2025 — chi vince?", category: "Cultura", timeAgo: "6h", live: true },
];

const CATEGORY_STYLES: Record<string, string> = {
  Sport: "bg-success-bg/90 text-success border-success/40 dark:bg-success-bg/50 dark:border-success/40",
  Politica: "bg-primary/15 text-primary border-primary/30 dark:bg-primary/20 dark:border-primary/40",
  Tecnologia: "bg-accent-secondary/20 text-accent-secondary border-accent-secondary/40 dark:border-accent-secondary/40",
  Economia: "bg-warning-bg/90 text-warning border-warning/40 dark:bg-warning-bg/50 dark:border-warning/40",
  Cultura: "bg-danger-bg/80 text-danger border-danger/40 dark:bg-danger-bg/50 dark:border-danger/40",
  Altro: "bg-surface/80 text-text-muted border-border dark:border-white/20",
};

function NewsBox({ item }: { item: NewsItem }) {
  const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.Altro;
  const content = (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border bg-white/5 dark:bg-white/5 backdrop-blur-sm hover:bg-white/10 dark:hover:bg-white/10 transition-colors min-w-[280px] md:min-w-[320px] shrink-0">
      {item.live && (
        <span className="flex h-2 w-2 rounded-full bg-danger animate-pulse shrink-0" aria-hidden />
      )}
      <span className={`shrink-0 px-2 py-0.5 rounded-lg text-xs font-bold border ${style}`}>
        {item.category}
      </span>
      <span className="text-sm md:text-base font-semibold text-fg truncate flex-1">
        {item.title}
      </span>
      {item.timeAgo && (
        <span className="text-xs text-fg-muted shrink-0">{item.timeAgo}</span>
      )}
    </div>
  );
  if (item.href) {
    return <Link href={item.href} className="block focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-2xl outline-none">{content}</Link>;
  }
  return content;
}

interface BreakingNewsTickerProps {
  items?: NewsItem[];
}

export default function BreakingNewsTicker({ items = FALLBACK_NEWS }: BreakingNewsTickerProps) {
  const duplicated = [...items, ...items];
  return (
    <section className="w-full overflow-hidden" aria-label="Ultime notizie ed eventi">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-fg-muted">
          Ultima ora · Eventi
        </span>
        <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-fg-muted/50 to-transparent" />
      </div>
      <div className="flex animate-marquee-slow whitespace-nowrap gap-4 will-change-transform">
        {duplicated.map((item) => (
          <NewsBox key={`${item.id}-${item.title}`} item={item} />
        ))}
      </div>
    </section>
  );
}
