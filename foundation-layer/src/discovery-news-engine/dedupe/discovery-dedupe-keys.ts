/**
 * Deterministic dedupe key derivation for discovery items and signals.
 * Keys are ordered by strength: url > ext > loc > titleTime.
 */

import { createHash } from "node:crypto";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoveryDedupeKey } from "../value-objects/discovery-dedupe-key.vo.js";
import { createDiscoveryDedupeKey } from "../value-objects/discovery-dedupe-key.vo.js";

const PREFIX_URL = "url:";
const PREFIX_EXT = "ext:";
const PREFIX_LOC = "loc:";
const PREFIX_TITLE_TIME = "titleTime:";

/**
 * Source keys that use structured/synthetic locators (sourceReference.locator)
 * as stable identity. Used to derive loc: keys. Exported for story clustering rules.
 */
export const STRUCTURED_SOURCE_KEYS_FOR_LOCATOR = new Set([
  "protezione-civile-rss",
  "ingv",
  "istat",
  "gazzetta-ufficiale",
  "ansa-rss",
  "agi-rss",
  "wikimedia-pageviews",
  "youtube-data-it",
  "google-trends-it",
]);

export type DedupeKeyWithKind = Readonly<{
  key: DiscoveryDedupeKey;
  kind: string;
  evidenceStrength: "strong" | "medium" | "weak";
}>;

function normalizeHeadline(headline: string): string {
  return headline
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Bucket a timestamp to the start of its 1-hour window (ISO string).
 */
function bucketToHourWindow(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return isoTimestamp;
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString();
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Derive all applicable dedupe keys from a normalized discovery item.
 * Order: url, ext, loc (if structured source), titleTime (if headline + publishedAt).
 */
export function deriveDedupeKeysFromItem(item: NormalizedDiscoveryItem): DedupeKeyWithKind[] {
  const out: DedupeKeyWithKind[] = [];

  if (item.canonicalUrl?.trim()) {
    const raw = `${PREFIX_URL}${item.canonicalUrl.trim()}`;
    out.push({
      key: createDiscoveryDedupeKey(raw),
      kind: "canonical_url",
      evidenceStrength: "strong",
    });
  }

  const sourceKey =
    item.sourceReference.sourceKeyNullable != null
      ? String(item.sourceReference.sourceKeyNullable).trim()
      : String(item.sourceReference.sourceId).trim();
  if (sourceKey && item.externalItemId?.trim()) {
    const raw = `${PREFIX_EXT}${sourceKey}:${item.externalItemId.trim()}`;
    out.push({
      key: createDiscoveryDedupeKey(raw),
      kind: "source_external_id",
      evidenceStrength: "strong",
    });
  }

  if (
    sourceKey &&
    item.sourceReference.locator?.trim() &&
    STRUCTURED_SOURCE_KEYS_FOR_LOCATOR.has(sourceKey)
  ) {
    const raw = `${PREFIX_LOC}${sourceKey}:${item.sourceReference.locator.trim()}`;
    out.push({
      key: createDiscoveryDedupeKey(raw),
      kind: "synthetic_locator",
      evidenceStrength: "strong",
    });
  }

  const headlineNorm = normalizeHeadline(item.headline ?? "");
  if (headlineNorm && item.publishedAt) {
    const windowStart = bucketToHourWindow(item.publishedAt);
    const hashInput = `${headlineNorm}|${windowStart}`;
    const hash = sha256Hex(hashInput);
    const raw = `${PREFIX_TITLE_TIME}${hash}|${windowStart}`;
    out.push({
      key: createDiscoveryDedupeKey(raw),
      kind: "title_time_window",
      evidenceStrength: "weak",
    });
  }

  return out;
}

/**
 * Derive dedupe keys from a signal. Uses payloadRef.normalizedItemId as an ext-like key
 * (source from context when available). When itemForSignal is provided, also derives
 * all item-backed keys.
 */
export function deriveDedupeKeysFromSignal(
  normalizedItemId: string,
  itemForSignal: NormalizedDiscoveryItem | null,
): DedupeKeyWithKind[] {
  const out: DedupeKeyWithKind[] = [];

  if (itemForSignal) {
    return deriveDedupeKeysFromItem(itemForSignal);
  }

  if (normalizedItemId?.trim()) {
    const raw = `${PREFIX_EXT}signal:${normalizedItemId.trim()}`;
    out.push({
      key: createDiscoveryDedupeKey(raw),
      kind: "source_external_id",
      evidenceStrength: "strong",
    });
  }

  return out;
}
