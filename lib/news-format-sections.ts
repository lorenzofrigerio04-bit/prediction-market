import type { NewsFormat } from "@/lib/news-engine/types";

export const NEWS_SECTION_SLUGS: Record<NewsFormat, string> = {
  BREAKING: "breaking",
  GOSSIP: "gossip",
  ANALYTICS: "analytics",
  REPORT: "report",
  HOT_TAKE: "hot-take",
};

export function slugFromNewsFormat(format: NewsFormat): string {
  return NEWS_SECTION_SLUGS[format];
}

export function newsFormatFromSlug(slug: string): NewsFormat | null {
  const entry = Object.entries(NEWS_SECTION_SLUGS).find(([, s]) => s === slug);
  return entry ? (entry[0] as NewsFormat) : null;
}

export type NewsSectionConfig = {
  format: NewsFormat;
  title: string;
  accent: "crimson" | "violet" | "primary" | "gold" | "emerald";
};

/** Ordine e titoli sezione homepage News (format → UI) */
export const NEWS_SECTIONS: NewsSectionConfig[] = [
  { format: "BREAKING", title: "Breaking News", accent: "crimson" },
  { format: "GOSSIP", title: "Gossip & Rumors", accent: "violet" },
  { format: "ANALYTICS", title: "Analytics", accent: "primary" },
  { format: "REPORT", title: "Report", accent: "gold" },
  { format: "HOT_TAKE", title: "Hot Takes", accent: "emerald" },
];
