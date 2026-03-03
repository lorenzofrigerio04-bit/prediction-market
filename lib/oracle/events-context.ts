/**
 * Aggregazione eventi per contesto Oracle Assistant.
 * Recupera eventi rilevanti per un topic e costruisce il contesto per l'LLM.
 */

import { prisma } from "@/lib/prisma";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";

export interface EventForContext {
  id: string;
  title: string;
  category: string;
  description: string | null;
  closesAt: Date;
  resolved: boolean;
  outcome: string | null;
  probabilityYes: number;
  predictionsCount: number;
}

/** Estrae parole chiave dal messaggio utente per la ricerca (rimuove stopwords comuni). */
function extractKeywords(message: string): string[] {
  const stopwords = new Set([
    "il", "la", "lo", "i", "le", "gli", "un", "una", "di", "da", "in", "su", "per", "con",
    "che", "cosa", "come", "quando", "dove", "perché", "previsione", "previsioni", "eventi",
    "evento", "del", "della", "dei", "delle", "questo", "questa", "questi", "queste",
  ]);
  const words = message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopwords.has(w));
  return [...new Set(words)];
}

/** Mappa categorie italiane per matching fuzzy. */
const CATEGORY_ALIASES: Record<string, string> = {
  sport: "Sport",
  sportivi: "Sport",
  calcio: "Sport",
  serie: "Sport",
  politica: "Politica",
  elezioni: "Politica",
  tecnologia: "Tecnologia",
  tech: "Tecnologia",
  economia: "Economia",
  finanza: "Economia",
  cultura: "Cultura",
  scienza: "Scienza",
  intrattenimento: "Intrattenimento",
};

/** Determina la categoria da usare nella query in base al messaggio. */
function inferCategory(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [alias, category] of Object.entries(CATEGORY_ALIASES)) {
    if (lower.includes(alias)) return category;
  }
  return null;
}

/**
 * Recupera eventi rilevanti per il topic/domanda dell'utente.
 * Cerca per: categoria inferita, keyword nel titolo/descrizione.
 */
export async function fetchEventsForTopic(
  userMessage: string,
  limit = 30
): Promise<EventForContext[]> {
  const keywords = extractKeywords(userMessage);
  const inferredCategory = inferCategory(userMessage);

  const orConditions: Array<Record<string, unknown>> = [];

  if (inferredCategory) {
    orConditions.push({ category: inferredCategory });
  }

  for (const kw of keywords.slice(0, 5)) {
    if (kw.length < 3) continue;
    orConditions.push({
      OR: [
        { title: { contains: kw, mode: "insensitive" as const } },
        { description: { contains: kw, mode: "insensitive" as const } },
      ],
    });
  }

  const where: Record<string, unknown> = {
    category: { not: "News" },
  };

  if (orConditions.length > 0) {
    where.OR = orConditions;
  } else {
    // Se nessuna keyword/categoria: prendi eventi recenti aperti
    where.resolved = false;
    where.closesAt = { gt: new Date() };
  }

  const events = await prisma.event.findMany({
    where,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      ammState: {
        select: { qYesMicros: true, qNoMicros: true, bMicros: true },
      },
      _count: {
        select: { Prediction: true },
      },
    },
  });

  return events.map((e) => {
    let probabilityYes = 50;
    if (e.ammState) {
      const yesMicros = priceYesMicros(
        e.ammState.qYesMicros,
        e.ammState.qNoMicros,
        e.ammState.bMicros
      );
      probabilityYes = Number((yesMicros * 100n) / SCALE);
    }
    return {
      id: e.id,
      title: e.title,
      category: e.category,
      description: e.description,
      closesAt: e.closesAt,
      resolved: e.resolved,
      outcome: e.outcome,
      probabilityYes,
      predictionsCount: e._count?.Prediction ?? 0,
    };
  });
}

/**
 * Costruisce il testo di contesto per il prompt LLM.
 */
export function buildEventsContextText(events: EventForContext[]): string {
  if (events.length === 0) {
    return "Nessun evento trovato sulla piattaforma per questo argomento. Basati sulla tua conoscenza generale e su fonti esterne attendibili (indicando sempre il livello di attendibilità).";
  }

  const lines = events.map((e) => {
    const status = e.resolved
      ? `RISOLTO (esito: ${e.outcome ?? "N/A"})`
      : `APERTO (scadenza: ${e.closesAt.toISOString().slice(0, 10)})`;
    return `- "${e.title}" | Categoria: ${e.category} | Probabilità SÌ: ${e.probabilityYes}% | Previsioni: ${e.predictionsCount} | ${status}`;
  });

  const avgProb =
    events.reduce((s, e) => s + e.probabilityYes, 0) / events.length;
  const totalPreds = events.reduce((s, e) => s + e.predictionsCount, 0);

  return `Eventi sulla piattaforma (${events.length} trovati, probabilità media SÌ: ${Math.round(avgProb)}%, totale previsioni: ${totalPreds}):\n${lines.join("\n")}`;
}
