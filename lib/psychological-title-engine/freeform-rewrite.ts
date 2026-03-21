/**
 * Psychological Title Engine - Rewrite per titoli freeform (MDE / discovery).
 * Applica le stesse regole di chiarezza e lunghezza usate per i titoli da template.
 */

const MAX_TITLE_LENGTH = 110;

/** Prefisso da rimuovere (titoli MDE "Reported event: ...") */
const REPORTED_EVENT_PREFIX = /^Reported\s+event\s*:\s*/i;

/**
 * Riscrive un titolo freeform (es. da MDE) per il mercato:
 * rimuove prefisso "Reported event:", deduplica frase ripetuta, assicura "?", tronca a MAX_TITLE_LENGTH.
 * Usato quando il titolo non proviene da template (StructuredCandidateEvent).
 */
export function rewriteFreeformTitleForMarket(rawTitle: string): string {
  let t = rawTitle.trim();
  if (!t) return rawTitle.trim() || "Evento?";

  if (REPORTED_EVENT_PREFIX.test(t)) {
    t = t.replace(REPORTED_EVENT_PREFIX, "").trim();
  }
  if (!t) return "Evento?";

  // Deduplica: stessa frase ripetuta due volte
  const half = Math.floor(t.length / 2);
  if (half >= 10) {
    const first = t.slice(0, half).trim();
    const second = t.slice(half).trim();
    if (first === second) t = first;
  }

  if (!t.endsWith("?")) t = `${t}?`;
  if (t.length > MAX_TITLE_LENGTH) {
    t = t.slice(0, MAX_TITLE_LENGTH - 1).trim();
    if (!t.endsWith("?")) t = `${t}?`;
  }
  return t;
}
