export type NewsFormat = "BREAKING" | "GOSSIP" | "ANALYTICS" | "REPORT" | "HOT_TAKE";

export type NewsCategory =
  | "serie-a"
  | "champions"
  | "calcio-mercato"
  | "nazionale"
  | "sport"
  | "premier-league"
  | "la-liga"
  | "bundesliga"
  | "scommesse";

export interface RawNewsInput {
  title: string;
  content: string;
  url: string;
  publishedAt?: Date;
  sourceId?: string;
}

export interface EnrichedArticle {
  slug: string;
  format: NewsFormat;
  category: NewsCategory;
  title: string;
  subtitle: string;
  body: string;
  excerpt: string;
  authorPersona: string;
  sourceUrls: string[];
  relatedEventId?: string;
  imageUrl?: string;
  readingTimeMin: number;
  featured: boolean;
  sourceHash: string;
}

export interface NewsEngineResult {
  generated: number;
  skipped: number;
  errors: number;
  durationMs: number;
}

/** Mappa format → voce editoriale (persona) */
export const PERSONAS: Record<NewsFormat, { name: string; style: string; avatar: string }> = {
  BREAKING: {
    name: "Luca Ferrara",
    avatar: "/personas/persona-luca-ferrara.jpg",
    style:
      "Sei Luca Ferrara, un giornalista sportivo veloce e preciso sulla quarantina. Scrivi notizie di calcio brevi, dirette e verificate. Tono professionale ma energico. Niente fronzoli, solo i fatti.",
  },
  GOSSIP: {
    name: "Sofia Ferretti",
    avatar: "/personas/persona-sofia-ferretti.jpg",
    style:
      "Sei Sofia Ferretti, una giornalista sportiva ironica e un po' pettegola. Ami i retroscena, le voci di corridoio, i dettagli piccanti. Usi un tono leggero, divertente, a volte sarcastico. Racconti i retroscena come al tavolo del bar con altri tifosi, senza vocativi rivolti a un pubblico femminile.",
  },
  ANALYTICS: {
    name: "Paolo Neri",
    avatar: "/personas/persona-paolo-neri.jpg",
    style:
      "Sei Paolo Neri, un analista dati sportivo sulla cinquantina, freddo e preciso. Parli di numeri, statistiche, probabilità, tendenze. Usi dati per supportare ogni affermazione. Il tuo stile è tecnico ma accessibile, come un podcast di analisi avanzata.",
  },
  REPORT: {
    name: "Marco De Santis",
    avatar: "/personas/persona-marco-desantis.jpg",
    style:
      "Sei Marco De Santis, un giornalista sportivo serio con 20 anni di esperienza. Scrivi report profondi, contestualizzi la notizia, dai una prospettiva a lungo termine. Il tuo tono è autorevole ma non pesante.",
  },
  HOT_TAKE: {
    name: "Alex Conti",
    avatar: "/personas/persona-alex-conti.jpg",
    style:
      "Sei Alex Conti, un commentatore calcistico provocatorio e diretto sui 30 anni. Non hai paura di dire cose impopolari, di criticare squadre, allenatori o giocatori. Usi un linguaggio forte ma non volgare. Vuoi far discutere. Ogni pezzo inizia con una tesi forte e controversa.",
  },
};

export const FORMAT_LABELS: Record<NewsFormat, string> = {
  BREAKING: "⚡ Breaking",
  GOSSIP: "🔥 Gossip",
  ANALYTICS: "📊 Analisi",
  REPORT: "📋 Report",
  HOT_TAKE: "🌶 Hot Take",
};

export const FORMAT_COLORS: Record<NewsFormat, { bg: string; text: string; border: string }> = {
  BREAKING: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
  GOSSIP: { bg: "rgba(236,72,153,0.12)", text: "#ec4899", border: "rgba(236,72,153,0.3)" },
  ANALYTICS: { bg: "rgba(80,245,252,0.12)", text: "#50f5fc", border: "rgba(80,245,252,0.3)" },
  REPORT: { bg: "rgba(234,179,8,0.12)", text: "#eab308", border: "rgba(234,179,8,0.3)" },
  HOT_TAKE: { bg: "rgba(249,115,22,0.12)", text: "#f97316", border: "rgba(249,115,22,0.3)" },
};

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  "serie-a": "Serie A",
  champions: "Champions League",
  "calcio-mercato": "Calciomercato",
  nazionale: "Nazionale",
  sport: "Sport",
  "premier-league": "Premier League",
  "la-liga": "La Liga",
  bundesliga: "Bundesliga",
  scommesse: "Scommesse",
};
