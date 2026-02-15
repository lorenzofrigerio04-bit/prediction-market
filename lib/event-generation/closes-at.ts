/**
 * Logica per l'assegnazione di closesAt (Fase 4: scadenza variabile).
 * Regole: data esplicita in titolo/descrizione → closesAt = quella data (o 1h prima);
 * altrimenti default per categoria o per type shortTerm/mediumTerm dall'LLM.
 */

import { getClosureRules, type ClosureRulesConfig } from "./config";
import type { AllowedCategory, GeneratedEvent } from "./types";
import type { VerifiedCandidate } from "../event-verification/types";

/** Output LLM opzionale: data evento o tipo di scadenza. */
export type ClosureHint = {
  eventDate?: string | null; // ISO 8601
  type?: "shortTerm" | "mediumTerm" | null;
};

const IT_MONTHS: Record<string, number> = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

/**
 * Cerca una data esplicita nel testo (titolo/descrizione/snippet).
 * Supporta: YYYY-MM-DD, DD/MM/YYYY, "il 15 marzo 2025", "15 marzo", "partita del 20 marzo", "elezioni dell'8 settembre".
 * @returns Date se trovata e interpretabile, null altrimenti.
 */
export function parseExplicitDateFromText(text: string): Date | null {
  if (!text || !text.trim()) return null;
  const s = text.trim();

  // ISO: YYYY-MM-DD (con eventuale T e ora)
  const iso = /(\d{4})-(\d{2})-(\d{2})(?:T|\s|$)/.exec(s);
  if (iso) {
    const d = new Date(Date.UTC(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10)));
    if (!Number.isNaN(d.getTime())) return d;
  }

  // DD/MM/YYYY o DD-MM-YYYY
  const dmy = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/.exec(s);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    const d = new Date(year, month, day);
    if (!Number.isNaN(d.getTime())) return d;
  }

  // "il 15 marzo 2025", "15 marzo 2025", "partita del 20 marzo", "elezioni dell'8 settembre 2025"
  const monthName = Object.keys(IT_MONTHS).join("|");
  const patterns = [
    new RegExp(`(?:il\\s+)?(\\d{1,2})\\s+(${monthName})\\s+(\\d{4})`, "i"),
    new RegExp(`(?:del\\s+|dell['']?\\s+|il\\s+)?(\\d{1,2})\\s+(${monthName})(?:\\s+(\\d{4}))?`, "i"),
  ];
  const now = new Date();
  const currentYear = now.getFullYear();

  for (const re of patterns) {
    const m = re.exec(s);
    if (m) {
      const day = parseInt(m[1], 10);
      const monthNameLower = m[2].toLowerCase();
      const month = IT_MONTHS[monthNameLower] ?? null;
      if (month == null) continue;
      const year = m[3] ? parseInt(m[3], 10) : currentYear;
      const d = new Date(year, month, day);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  return null;
}

/**
 * Calcola closesAt garantendo che sia nel futuro e almeno minHoursFromNow da ora.
 * Priorità: 1) data estratta da testo, 2) eventDate dall'LLM, 3) type shortTerm/mediumTerm, 4) default categoria.
 */
export function computeClosesAt(
  candidate: VerifiedCandidate,
  generated: GeneratedEvent & ClosureHint,
  category: AllowedCategory,
  rules?: ClosureRulesConfig
): string {
  const config = rules ?? getClosureRules();
  const now = new Date();
  const minClose = new Date(now.getTime() + config.minHoursFromNow * 60 * 60 * 1000);

  const text = [
    candidate.title,
    candidate.snippet ?? "",
    generated.title,
    generated.description ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  // 1) Data esplicita nel testo
  const parsedFromText = parseExplicitDateFromText(text);
  if (parsedFromText && parsedFromText.getTime() >= now.getTime()) {
    const closeAt = new Date(parsedFromText.getTime() - config.hoursBeforeEvent * 60 * 60 * 1000);
    return closeAt.getTime() >= minClose.getTime() ? closeAt.toISOString() : minClose.toISOString();
  }

  // 2) eventDate dall'LLM (ISO)
  const eventDateStr = generated.eventDate;
  if (eventDateStr) {
    const eventDate = new Date(eventDateStr);
    if (!Number.isNaN(eventDate.getTime()) && eventDate.getTime() >= now.getTime()) {
      const closeAt = new Date(eventDate.getTime() - config.hoursBeforeEvent * 60 * 60 * 1000);
      const candidateClose = closeAt.getTime() >= minClose.getTime() ? closeAt : minClose;
      return candidateClose.toISOString();
    }
  }

  // 3) type shortTerm / mediumTerm dall'LLM
  const termType = generated.type;
  let daysToAdd: number;
  if (termType === "shortTerm") {
    daysToAdd = config.shortTermDays;
  } else if (termType === "mediumTerm") {
    daysToAdd = config.mediumTermDays;
  } else {
    daysToAdd = config.defaultDaysByCategory[category];
  }

  const closeAt = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  if (closeAt.getTime() < minClose.getTime()) return minClose.toISOString();
  return closeAt.toISOString();
}
