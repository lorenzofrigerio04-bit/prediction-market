/**
 * Deterministic dedupe key derivation for discovery items and signals.
 * Keys are ordered by strength: url > ext > loc > titleTime.
 */
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoveryDedupeKey } from "../value-objects/discovery-dedupe-key.vo.js";
/**
 * Source keys that use structured/synthetic locators (sourceReference.locator)
 * as stable identity. Used to derive loc: keys. Exported for story clustering rules.
 */
export declare const STRUCTURED_SOURCE_KEYS_FOR_LOCATOR: Set<string>;
export type DedupeKeyWithKind = Readonly<{
    key: DiscoveryDedupeKey;
    kind: string;
    evidenceStrength: "strong" | "medium" | "weak";
}>;
/**
 * Derive all applicable dedupe keys from a normalized discovery item.
 * Order: url, ext, loc (if structured source), titleTime (if headline + publishedAt).
 */
export declare function deriveDedupeKeysFromItem(item: NormalizedDiscoveryItem): DedupeKeyWithKind[];
/**
 * Derive dedupe keys from a signal. Uses payloadRef.normalizedItemId as an ext-like key
 * (source from context when available). When itemForSignal is provided, also derives
 * all item-backed keys.
 */
export declare function deriveDedupeKeysFromSignal(normalizedItemId: string, itemForSignal: NormalizedDiscoveryItem | null): DedupeKeyWithKind[];
//# sourceMappingURL=discovery-dedupe-keys.d.ts.map