/**
 * Step 5 – Regola "quando slide vs quando immagine"
 *
 * Assegna post.type (SLIDE | AI_IMAGE) alla creazione del post.
 * Regola E + cap 10%:
 * - AI_IMAGE se c'è commento personale (content non vuoto), oppure
 * - AI_IMAGE se l'evento è "adattabile" (categoria/titolo adatti a un'immagine)
 *   e rientra nel 10% deterministico (per limitare volume su molti eventi).
 * - SLIDE in tutti gli altri casi.
 *
 * Usato da: POST /api/posts (Step 6) e runSimulatedPosts (Step 10).
 * La generazione effettiva dell'immagine (aiImageUrl) è nello Step 9.
 */

import { createHash } from "crypto";

export type PostTypeResult = "SLIDE" | "AI_IMAGE";

/** Input minimo evento per la regola (id, title, category; description opzionale). */
export interface PostTypeEventInput {
  id: string;
  title: string;
  category: string;
  description?: string | null;
}

/** Categorie considerate "adattabili" a un'immagine (whitelist). In futuro si può sostituire con uno scorer più fine. */
const ADATTABILI_CATEGORIES = ["Sport", "Politica", "Tecnologia"] as const;

const MIN_TITLE_LENGTH = 10;

/**
 * Considera l'evento adatto a essere illustrato con un'immagine AI (categoria in whitelist, titolo non troppo corto).
 * In futuro si può sostituire con uno scorer su parole chiave / descrizione.
 */
export function isEventAdattabile(event: PostTypeEventInput): boolean {
  const cat = (event.category || "").trim();
  if (!cat) return false;
  const match = ADATTABILI_CATEGORIES.some(
    (c) => c.toLowerCase() === cat.toLowerCase()
  );
  if (!match) return false;
  const titleLen = (event.title || "").trim().length;
  return titleLen >= MIN_TITLE_LENGTH;
}

/**
 * Circa 10% degli eventi (deterministico per eventId) per limitare il volume di generazioni.
 * Stesso evento → stesso esito sempre.
 */
export function isInAdattabiliQuota10(eventId: string): boolean {
  const hash = createHash("sha256").update(eventId).digest();
  const firstByte = hash.readUInt8(0);
  return firstByte % 10 === 0;
}

/**
 * Determina il tipo di post (SLIDE vs AI_IMAGE) alla creazione.
 * - Con commento (content non vuoto) → AI_IMAGE.
 * - Senza commento ma evento adattabile e nel 10% → AI_IMAGE.
 * - Altrimenti → SLIDE.
 */
export function getPostType(
  event: PostTypeEventInput,
  content?: string | null,
  _source?: string
): PostTypeResult {
  const hasComment =
    typeof content === "string" && content.trim().length > 0;
  if (hasComment) return "AI_IMAGE";

  if (isEventAdattabile(event) && isInAdattabiliQuota10(event.id)) {
    return "AI_IMAGE";
  }

  return "SLIDE";
}
