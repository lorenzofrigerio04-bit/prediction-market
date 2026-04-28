/**
 * Arricchimento editoriale — trasforma notizie raw in contenuto per la sezione News.
 * Ogni articolo viene assegnato a un formato (BREAKING/GOSSIP/ANALYTICS/REPORT/HOT_TAKE)
 * e scritto con la voce corrispondente.
 */

import OpenAI from "openai";
import crypto from "crypto";
import type { RawNewsInput, EnrichedArticle, NewsFormat, NewsCategory } from "./types";
import { PERSONAS } from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = "gpt-4o-mini";

function hashArticle(input: RawNewsInput): string {
  return crypto
    .createHash("sha256")
    .update(input.url + input.title)
    .digest("hex")
    .slice(0, 32);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Determina il formato giusto in base al contenuto */
function assignFormat(
  input: RawNewsInput,
  index: number,
  total: number,
  isPlatformData: boolean
): NewsFormat {
  if (isPlatformData) return "ANALYTICS";

  const lower = (input.title + " " + input.content).toLowerCase();

  // Logica di routing basata su keywords
  const gossipSignals = [
    "voci", "rumor", "indiscrezione", "pare che", "si dice", "trattativa",
    "sarebbe", "potrebbe", "interesse", "contatti", "agente", "contratto",
    "rinnovo", "addio", "farewell", "transfer", "deal", "rumour",
  ];
  const hotTakeSignals = [
    "errore", "disastro", "vergogna", "critica", "basta", "fallimento",
    "pessimo", "scandaloso", "inaccettabile", "inspiegabile",
  ];
  const analyticsSignals = [
    "statistiche", "dati", "percentuale", "probabilità", "quote", "odds",
    "analisi", "record", "ranking", "classifica", "%",
  ];
  const reportSignals = [
    "analisi", "approfondimento", "storia", "retrospettiva", "intervista",
    "esclusivo", "speciale",
  ];

  const isGossip = gossipSignals.some((s) => lower.includes(s));
  const isHotTake = hotTakeSignals.some((s) => lower.includes(s));
  const isAnalytics = analyticsSignals.some((s) => lower.includes(s));
  const isReport = reportSignals.some((s) => lower.includes(s));

  if (isGossip && !isHotTake) return "GOSSIP";
  if (isHotTake) return "HOT_TAKE";
  if (isAnalytics) return "ANALYTICS";
  if (isReport) return "REPORT";

  // Distribuzione ciclica per varietà
  const formats: NewsFormat[] = ["BREAKING", "GOSSIP", "ANALYTICS", "REPORT", "HOT_TAKE"];
  return formats[index % formats.length];
}

/** Determina la categoria in base al contenuto */
function assignCategory(title: string, content: string): NewsCategory {
  const lower = (title + " " + content).toLowerCase();
  if (lower.includes("champions") || lower.includes("ucl")) return "champions";
  if (lower.includes("mercato") || lower.includes("transfer") || lower.includes("trattativa") || lower.includes("compra")) return "calcio-mercato";
  if (lower.includes("nazionale") || lower.includes("azzurri") || lower.includes("mancini")) return "nazionale";
  if (lower.includes("premier") || lower.includes("arsenal") || lower.includes("chelsea") || lower.includes("city") || lower.includes("united")) return "premier-league";
  if (lower.includes("liga") || lower.includes("real madrid") || lower.includes("barça") || lower.includes("atletico")) return "la-liga";
  if (lower.includes("bundesliga") || lower.includes("bayern") || lower.includes("dortmund")) return "bundesliga";
  if (lower.includes("quote") || lower.includes("scommess") || lower.includes("odds") || lower.includes("probabilità")) return "scommesse";
  if (lower.includes("serie a") || lower.includes("milan") || lower.includes("inter") || lower.includes("juventus") || lower.includes("napoli") || lower.includes("roma")) return "serie-a";
  return "sport";
}

interface EditorialDraft {
  title: string;
  subtitle: string;
  body: string;
  excerpt: string;
}

/** Produce bozza titolo/sottotitolo/corpo per un singolo articolo */
async function generateContent(
  input: RawNewsInput,
  format: NewsFormat,
  relatedEventContext?: string
): Promise<EditorialDraft | null> {
  const persona = PERSONAS[format];

  const systemPrompt = `${persona.style}

Regole ferree:
- Scrivi SEMPRE in italiano corretto e fluente
- NON inventare fatti non presenti nella notizia originale
- NON usare emoji nel body (solo nel title se appropriato)
- Il tone of voice deve essere coerente con il tuo personaggio
- NON menzionare intelligenza artificiale, chatbot, automazione della scrittura, né dire o insinuare che il pezzo sia "generato" o prodotto da software
- Pubblico: rivolgiti a lettori/tifosi in modo neutro (es. "chi segue il calcio", "i tifosi", "il lettore"). È VIETATO indirizzare o presupporre un pubblico femminile: niente "care lettrici", "ragazze", "amiche", "per le donne", angolature da lifestyle o gossip rivolto alle donne, seconda persona femminile plurale o qualsiasi incitamento rivolto specificamente alle donne. Questa regola vale per titolo, sottotitolo, corpo ed excerpt.
- Body: da 150 a 350 parole, paragrafi brevi (max 3-4 righe)
- Excerpt: 1 sola frase di max 25 parole, deve far venire voglia di leggere
- Subtitle: 1 frase di max 15 parole che contestualizza il titolo
${relatedEventContext ? `\nContexto piattaforma: ${relatedEventContext}` : ""}

Rispondi SOLO con JSON valido nel formato:
{
  "title": "...",
  "subtitle": "...",
  "body": "...",
  "excerpt": "..."
}`;

  const userPrompt = `Notizia originale:
TITOLO: ${input.title}
CONTENUTO: ${input.content.slice(0, 1500)}
FONTE: ${input.sourceId ?? "web"}
DATA: ${input.publishedAt?.toLocaleDateString("it-IT") ?? "oggi"}

${format === "ANALYTICS" && input.url.includes("predictionmaster") 
  ? "Questi sono dati ESCLUSIVI della nostra piattaforma. Evidenzialo nel tuo pezzo come un insight unico."
  : ""}

Scrivi un articolo in formato ${format} seguendo il tuo personaggio.`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: format === "HOT_TAKE" ? 0.95 : format === "GOSSIP" ? 0.85 : 0.7,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<EditorialDraft>;
    if (!parsed.title || !parsed.body || !parsed.excerpt) return null;

    return {
      title: parsed.title,
      subtitle: parsed.subtitle ?? "",
      body: parsed.body,
      excerpt: parsed.excerpt,
    };
  } catch (err) {
    console.error("[news-engine/enricher] Editorial draft failed:", err);
    return null;
  }
}

/** Trova evento correlato sulla piattaforma */
async function findRelatedEvent(
  title: string,
  content: string
): Promise<string | undefined> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const keywords = title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 3);

    if (keywords.length === 0) return undefined;

    const event = await prisma.event.findFirst({
      where: {
        status: "OPEN",
        hidden: false,
        OR: keywords.map((kw) => ({
          title: { contains: kw, mode: "insensitive" as const },
        })),
      },
      orderBy: { totalCredits: "desc" },
    });

    return event?.id;
  } catch {
    return undefined;
  }
}

/** Enriches a single article */
export async function enrichArticle(
  input: RawNewsInput,
  format: NewsFormat,
  isPlatformData: boolean
): Promise<EnrichedArticle | null> {
  const sourceHash = hashArticle(input);
  const category = assignCategory(input.title, input.content);

  const relatedEventId = await findRelatedEvent(input.title, input.content);
  const relatedEventContext = relatedEventId
    ? `Esiste un evento correlato sulla piattaforma (id: ${relatedEventId}) dove gli utenti possono scommettere.`
    : undefined;

  const draft = await generateContent(input, format, relatedEventContext);
  if (!draft) return null;

  const baseSlug = slugify(draft.title);
  const slug = `${baseSlug}-${sourceHash.slice(0, 8)}`;

  const persona = PERSONAS[format];

  return {
    slug,
    format,
    category,
    title: draft.title,
    subtitle: draft.subtitle,
    body: draft.body,
    excerpt: draft.excerpt,
    authorPersona: persona.name,
    sourceUrls: [input.url],
    relatedEventId,
    imageUrl: undefined,
    readingTimeMin: estimateReadingTime(draft.body),
    featured: isPlatformData || format === "REPORT",
    sourceHash,
  };
}

/** Distributes articles across formats for variety */
export function planEnrichmentQueue(
  general: RawNewsInput[],
  platform: RawNewsInput[]
): Array<{ input: RawNewsInput; format: NewsFormat; isPlatform: boolean }> {
  const queue: Array<{ input: RawNewsInput; format: NewsFormat; isPlatform: boolean }> = [];

  // Platform data → sempre ANALYTICS
  for (const p of platform.slice(0, 3)) {
    queue.push({ input: p, format: "ANALYTICS", isPlatform: true });
  }

  // General → distribuzione intelligente
  const generalSlice = general.slice(0, 15);
  for (let i = 0; i < generalSlice.length; i++) {
    const input = generalSlice[i];
    const format = assignFormat(input, i, generalSlice.length, false);
    queue.push({ input, format, isPlatform: false });
  }

  return queue;
}
