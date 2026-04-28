import type { NewsFormat } from "@/lib/news-engine/types";

export function timeAgo(dateInput: string | Date): string {
  const dateStr = typeof dateInput === "string" ? dateInput : dateInput.toISOString();
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 2) return "Ora";
  if (m < 60) return `${m}m fa`;
  if (h < 24) return `${h}h fa`;
  if (d < 7) return `${d}g fa`;
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export const FORMAT_ACCENT: Record<
  NewsFormat,
  { glow: string; dot: string; labelColor: string; cardBorder: string; topBar: string }
> = {
  BREAKING: {
    glow: "rgba(244,63,94,0.18)",
    dot: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]",
    labelColor: "text-rose-400",
    cardBorder: "rgba(244,63,94,0.22)",
    topBar: "linear-gradient(90deg,rgba(244,63,94,0.85) 0%,rgba(244,63,94,0.22) 55%,transparent 100%)",
  },
  GOSSIP: {
    glow: "rgba(167,139,250,0.15)",
    dot: "bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.65)]",
    labelColor: "text-violet-300",
    cardBorder: "rgba(167,139,250,0.2)",
    topBar: "linear-gradient(90deg,rgba(167,139,250,0.80) 0%,rgba(167,139,250,0.18) 55%,transparent 100%)",
  },
  ANALYTICS: {
    glow: "rgba(80,245,252,0.14)",
    dot: "bg-primary shadow-[0_0_10px_rgba(80,245,252,0.65)]",
    labelColor: "text-primary",
    cardBorder: "rgba(80,245,252,0.18)",
    topBar: "linear-gradient(90deg,rgba(80,245,252,0.70) 0%,rgba(80,245,252,0.14) 55%,transparent 100%)",
  },
  REPORT: {
    glow: "rgba(252,211,77,0.14)",
    dot: "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.55)]",
    labelColor: "text-amber-300",
    cardBorder: "rgba(252,211,77,0.18)",
    topBar: "linear-gradient(90deg,rgba(252,211,77,0.70) 0%,rgba(252,211,77,0.14) 55%,transparent 100%)",
  },
  HOT_TAKE: {
    glow: "rgba(52,211,153,0.12)",
    dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.65)]",
    labelColor: "text-emerald-300",
    cardBorder: "rgba(52,211,153,0.18)",
    topBar: "linear-gradient(90deg,rgba(52,211,153,0.70) 0%,rgba(52,211,153,0.14) 55%,transparent 100%)",
  },
};

export function formatArticleKindLabel(format: NewsFormat): string {
  switch (format) {
    case "BREAKING":
      return "Breaking";
    case "GOSSIP":
      return "Gossip";
    case "ANALYTICS":
      return "Analytics";
    case "REPORT":
      return "Report";
    case "HOT_TAKE":
      return "Hot Take";
    default:
      return "News";
  }
}

export const PERSONA_AVATARS: Record<string, string> = {
  "Luca Ferrara": "/personas/persona-luca-ferrara.jpg",
  "Sofia Ferretti": "/personas/persona-sofia-ferretti.jpg",
  "Paolo Neri": "/personas/persona-paolo-neri.jpg",
  "Marco De Santis": "/personas/persona-marco-desantis.jpg",
  "Alex Conti": "/personas/persona-alex-conti.jpg",
  Redazione: "/personas/persona-luca-ferrara.jpg",
  "Data Lab": "/personas/persona-paolo-neri.jpg",
  "Il Boss": "/personas/persona-alex-conti.jpg",
};

export const PERSONA_DISPLAY_NAME: Record<string, string> = {
  Redazione: "Luca Ferrara",
  "Data Lab": "Paolo Neri",
  "Il Boss": "Alex Conti",
};
