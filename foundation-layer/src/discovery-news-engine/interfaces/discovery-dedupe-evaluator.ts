import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type {
  DiscoveryDedupeDecision,
  DiscoveryDedupeDecisionV1,
} from "../entities/discovery-dedupe-decision.entity.js";
import type { DiscoveryDedupeKey } from "../value-objects/discovery-dedupe-key.vo.js";

export type DiscoveryDedupeContext = Readonly<Record<string, unknown>>;

/** Context shape for evaluateItem / evaluateSignal (v1). */
export type DiscoveryDedupeContextV1 = Readonly<{
  /** Items already accepted/seen before the current candidate. Must not include the candidate (no self-match). */
  withinRunItems?: readonly NormalizedDiscoveryItem[];
  priorItems?: readonly NormalizedDiscoveryItem[];
  withinRunSignals?: readonly DiscoverySignal[];
  priorSignals?: readonly DiscoverySignal[];
  getItemForNormalizedId?: (id: string) => NormalizedDiscoveryItem | null;
}>;

export interface DiscoveryDedupeEvaluator {
  evaluate(
    key: DiscoveryDedupeKey,
    candidate: unknown,
    context: DiscoveryDedupeContext,
  ): DiscoveryDedupeDecision;

  evaluateItem(
    candidate: NormalizedDiscoveryItem,
    context: DiscoveryDedupeContextV1,
  ): DiscoveryDedupeDecisionV1;

  evaluateSignal(
    candidate: DiscoverySignal,
    context: DiscoveryDedupeContextV1,
  ): DiscoveryDedupeDecisionV1;
}
