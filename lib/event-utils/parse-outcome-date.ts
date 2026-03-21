/**
 * Parse outcome date from text (titolo/descrizione).
 * Extracted from event-generation for shared use (validator, admin, seed, scripts).
 */

const IT_MONTHS: Record<string, number> = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

/**
 * Estrae la data di esito dell'evento (quando si saprà il risultato).
 * Supporta: "fine del 2023", "entro il 2025", "entro 6 mesi", "dicembre 2025", date esplicite.
 */
export function parseOutcomeDateFromText(text: string): Date | null {
  if (!text || !text.trim()) return null;
  const s = text.trim();
  const now = new Date();

  const entroMesi = /\b(?:entro|nei\s+prossimi?)\s+(\d{1,2})\s+mesi?\b/i.exec(s);
  if (entroMesi) {
    const mesi = parseInt(entroMesi[1], 10);
    if (mesi >= 1 && mesi <= 24) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + mesi);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  const fineAnno = /\b(?:fine\s+(?:del\s+)?|entro\s+(?:la\s+)?fine\s+(?:del\s+)?)(\d{4})\b/i.exec(s);
  if (fineAnno) {
    const year = parseInt(fineAnno[1], 10);
    const d = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    if (!Number.isNaN(d.getTime())) return d;
  }

  const entroAnno = /\bentro\s+il\s+(\d{4})\b/i.exec(s);
  if (entroAnno) {
    const year = parseInt(entroAnno[1], 10);
    const d = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    if (!Number.isNaN(d.getTime())) return d;
  }

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
 * Cerca una data esplicita nel testo (YYYY-MM-DD, DD/MM/YYYY, "il 15 marzo 2025", etc.)
 */
export function parseExplicitDateFromText(text: string): Date | null {
  if (!text || !text.trim()) return null;
  const s = text.trim();

  const iso = /(\d{4})-(\d{2})-(\d{2})(?:T|\s|$)/.exec(s);
  if (iso) {
    const d = new Date(Date.UTC(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10)));
    if (!Number.isNaN(d.getTime())) return d;
  }

  const dmy = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/.exec(s);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    const d = new Date(year, month, day);
    if (!Number.isNaN(d.getTime())) return d;
  }

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
