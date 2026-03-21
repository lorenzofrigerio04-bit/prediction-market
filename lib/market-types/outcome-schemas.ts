/**
 * Schemi per outcomes (multi-opzione) e scalarConfig (mercati numerici).
 * Usati da Event.outcomes e Event.scalarConfig nel DB.
 */

/** Singola opzione per MULTIPLE_CHOICE, RANGE, TIME_TO_EVENT, COUNT_VOLUME, RANKING */
export interface MarketOutcomeOption {
  key: string;
  label: string;
  order?: number;
}

/** Configurazione per mercati SCALAR */
export interface ScalarConfig {
  min: number;
  max: number;
  unit: string;
}

export function parseOutcomesJson(value: unknown): MarketOutcomeOption[] | null {
  if (!Array.isArray(value)) return null;
  const out: MarketOutcomeOption[] = [];
  for (const item of value) {
    if (item && typeof item === "object" && "key" in item && "label" in item) {
      const key = String((item as { key: unknown }).key).trim();
      const label = String((item as { label: unknown }).label).trim();
      if (key && label) {
        out.push({
          key,
          label,
          order: typeof (item as { order?: unknown }).order === "number" ? (item as { order: number }).order : undefined,
        });
      }
    }
  }
  return out.length > 0 ? out : null;
}

/** Restituisce le chiavi valide per la risoluzione da Event.outcomes (JSON). */
export function getValidOutcomeKeys(outcomesJson: unknown): string[] {
  const options = parseOutcomesJson(outcomesJson);
  return options ? options.map((o) => o.key) : [];
}

/**
 * Titolo da mostrare in UI per mercati multi-opzione: rimuove dal titolo la parte
 * che elenca le opzioni (es. " : <5€ | 5-10€ | 10€+?") così le opzioni compaiono
 * solo come pulsanti sotto, non nel titolo.
 * Se outcomesJson è vuoto ma il titolo contiene " : ... | ...", rimuove comunque quella parte.
 */
export function getEventDisplayTitle(title: string, outcomesJson?: unknown): string {
  const t = title.trim();
  if (!t) return t;
  const options = parseOutcomesJson(outcomesJson);
  const hasOptionsInTitle = t.includes("|") && t.lastIndexOf(":") >= 0;
  if ((options && options.length > 0) || hasOptionsInTitle) {
    const lastColon = t.lastIndexOf(":");
    if (lastColon >= 0) {
      const afterColon = t.slice(lastColon + 1).trim();
      if (afterColon.includes("|")) {
        const before = t.slice(0, lastColon).trim().replace(/\?+\s*$/, "").trim();
        return before ? `${before}?` : t;
      }
    }
  }
  return t;
}

/** Slug per chiave outcome (key) da label: lowercase, spazi → trattini, rimuove caratteri non alfanumerici */
function slugFromLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "opt";
}

/**
 * Estrae opzioni dal titolo quando contiene un elenco dopo ":" con "|"
 * (es. "Prezzo uova 2026: <5€ | 5-10€ | 10€+?" → [{ key: "lt5", label: "<5€" }, ...]).
 * Usato quando marketType è multi-opzione ma outcomes non è popolato (eventi già creati o publish).
 */
export function deriveOutcomesFromTitle(title: string): MarketOutcomeOption[] {
  const t = title.trim();
  if (!t) return [];
  const lastColon = t.lastIndexOf(":");
  if (lastColon < 0) return [];
  const afterColon = t.slice(lastColon + 1).trim().replace(/\?+\s*$/, "").trim();
  if (!afterColon.includes("|")) return [];
  const labels = afterColon.split("|").map((s) => s.trim()).filter(Boolean);
  if (labels.length < 2) return [];
  const seen = new Set<string>();
  const out: MarketOutcomeOption[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]!;
    let key = slugFromLabel(label);
    if (seen.has(key)) key = `${key}_${i}`;
    seen.add(key);
    out.push({ key, label, order: i });
  }
  return out;
}

export function parseScalarConfigJson(value: unknown): ScalarConfig | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  const min = typeof o.min === "number" ? o.min : null;
  const max = typeof o.max === "number" ? o.max : null;
  const unit = typeof o.unit === "string" ? o.unit.trim() : "";
  if (min == null || max == null || !unit || min >= max) return null;
  return { min, max, unit };
}
