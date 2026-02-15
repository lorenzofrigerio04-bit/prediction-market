/**
 * Logica per l'assegnazione di closesAt (Fase 4: scadenza variabile).
 * Coerenza: la scadenza (closesAt) deve corrispondere al momento in cui l'esito è verificabile.
 * - Se titolo/descrizione indicano una data esito (es. "entro fine 2023", "elezioni 2025"):
 *   - data esito nel passato → evento rifiutato;
 *   - data esito oltre maxHorizonDays → evento rifiutato;
 *   - altrimenti closesAt = data esito - hoursBeforeEvent.
 * - Senza data esplicita: shortTerm/mediumTerm (coerente con eventi senza data precisa).
 */

import { getClosureRules, type ClosureRulesConfig } from "./config";
import type { AllowedCategory, GeneratedEvent } from "./types";
import type { VerifiedCandidate } from "../event-verification/types";

/** Output LLM opzionale: data evento o tipo di scadenza. */
export type ClosureHint = {
  eventDate?: string | null; // ISO 8601
  type?: "shortTerm" | "mediumTerm" | null;
};

/** Risultato: closesAt valido oppure rifiuto (es. esito nel passato o troppo lontano). */
export type ClosureResult =
  | { ok: true; closesAt: string }
  | { ok: false; reject: true; reason: string };

const IT_MONTHS: Record<string, number> = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

/**
 * Estrae la data di esito dell'evento (quando si saprà il risultato).
 * Oltre a parseExplicitDateFromText, supporta: "fine del 2023", "entro il 2025", "entro la fine del 2024", "dicembre 2025".
 */
export function parseOutcomeDateFromText(text: string): Date | null {
  if (!text || !text.trim()) return null;
  const s = text.trim();
  const now = new Date();

  // "entro 6 mesi", "nei prossimi 6 mesi" → data = oggi + N mesi (esito verificabile a quella data)
  const entroMesi = /\b(?:entro|nei\s+prossimi?)\s+(\d{1,2})\s+mesi?\b/i.exec(s);
  if (entroMesi) {
    const mesi = parseInt(entroMesi[1], 10);
    if (mesi >= 1 && mesi <= 24) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + mesi);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  // "fine del 2023", "fine 2023", "entro la fine del 2024", "entro fine 2024"
  const fineAnno = /\b(?:fine\s+(?:del\s+)?|entro\s+(?:la\s+)?fine\s+(?:del\s+)?)(\d{4})\b/i.exec(s);
  if (fineAnno) {
    const year = parseInt(fineAnno[1], 10);
    const d = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    if (!Number.isNaN(d.getTime())) return d;
  }

  // "entro il 2025", "entro il 2026"
  const entroAnno = /\bentro\s+il\s+(\d{4})\b/i.exec(s);
  if (entroAnno) {
    const year = parseInt(entroAnno[1], 10);
    const d = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    if (!Number.isNaN(d.getTime())) return d;
  }

  // "nel 2025", "entro il 2025" già gestito; "dicembre 2025", "a dicembre 2025"
  const meseAnno = new RegExp(
    `\\b(?:a\\s+|nel\\s+|di\\s+)?(${Object.keys(IT_MONTHS).join("|")})\\s+(\\d{4})\\b`,
    "i"
  ).exec(s);
  if (meseAnno) {
    const monthName = meseAnno[1].toLowerCase();
    const month = IT_MONTHS[monthName] ?? null;
    const year = parseInt(meseAnno[2], 10);
    if (month != null) {
      const lastDay = new Date(year, month + 1, 0).getDate();
      const d = new Date(year, month, lastDay, 23, 59, 59, 999);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  return parseExplicitDateFromText(text);
}

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
 * Calcola closesAt garantendo coerenza con la data esito dell'evento.
 * - Se è rilevabile una data esito (testo o eventDate LLM): rifiuta se nel passato o oltre maxHorizonDays; altrimenti closesAt = data esito - hoursBeforeEvent.
 * - Altrimenti: shortTerm/mediumTerm (sempre nel futuro).
 * Restituisce ClosureResult (ok + closesAt oppure reject + reason).
 */
export function computeClosesAt(
  candidate: VerifiedCandidate,
  generated: GeneratedEvent & ClosureHint,
  category: AllowedCategory,
  rules?: ClosureRulesConfig
): ClosureResult {
  const config = rules ?? getClosureRules();
  const now = new Date();
  const minClose = new Date(now.getTime() + config.minHoursFromNow * 60 * 60 * 1000);
  const maxHorizon = new Date(now.getTime() + config.maxHorizonDays * 24 * 60 * 60 * 1000);

  const text = [
    candidate.title,
    candidate.snippet ?? "",
    generated.title,
    generated.description ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  // 1) Data esito da testo (include "fine 2023", "entro 2025", date esplicite)
  const outcomeFromText = parseOutcomeDateFromText(text);
  if (outcomeFromText) {
    if (outcomeFromText.getTime() < now.getTime()) {
      return {
        ok: false,
        reject: true,
        reason: `La data esito dell'evento (${outcomeFromText.toISOString().slice(0, 10)}) è nel passato`,
      };
    }
    if (outcomeFromText.getTime() > maxHorizon.getTime()) {
      return {
        ok: false,
        reject: true,
        reason: `La data esito è oltre l'orizzonte massimo (${config.maxHorizonDays} giorni)`,
      };
    }
    const closeAt = new Date(outcomeFromText.getTime() - config.hoursBeforeEvent * 60 * 60 * 1000);
    const clamped = closeAt.getTime() >= minClose.getTime() ? closeAt : minClose;
    return { ok: true, closesAt: clamped.toISOString() };
  }

  // 2) eventDate dall'LLM (ISO)
  const eventDateStr = generated.eventDate;
  if (eventDateStr) {
    const eventDate = new Date(eventDateStr);
    if (!Number.isNaN(eventDate.getTime())) {
      if (eventDate.getTime() < now.getTime()) {
        return {
          ok: false,
          reject: true,
          reason: `eventDate dall'LLM (${eventDateStr}) è nel passato`,
        };
      }
      if (eventDate.getTime() > maxHorizon.getTime()) {
        return {
          ok: false,
          reject: true,
          reason: `eventDate oltre l'orizzonte massimo (${config.maxHorizonDays} giorni)`,
        };
      }
      const closeAt = new Date(eventDate.getTime() - config.hoursBeforeEvent * 60 * 60 * 1000);
      const candidateClose = closeAt.getTime() >= minClose.getTime() ? closeAt : minClose;
      return { ok: true, closesAt: candidateClose.toISOString() };
    }
  }

  // 3) Nessuna data esplicita: shortTerm / mediumTerm (coerente per eventi senza data precisa)
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
  const clamped = closeAt.getTime() < minClose.getTime() ? minClose : closeAt;
  return { ok: true, closesAt: clamped.toISOString() };
}
