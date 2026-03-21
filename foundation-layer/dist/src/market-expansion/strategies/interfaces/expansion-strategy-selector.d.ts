import type { CanonicalEventIntelligence } from "../../../event-intelligence/canonicalization/entities/canonical-event.entity.js";
import type { EventGraphNode } from "../../../event-intelligence/graph/entities/event-graph-node.entity.js";
import type { ExpansionStrategy } from "../entities/expansion-strategy.entity.js";
export type ExpansionStrategySelectorInput = Readonly<{
    canonical_event: CanonicalEventIntelligence;
    event_graph_context: readonly EventGraphNode[];
}>;
export interface ExpansionStrategySelector {
    select(input: ExpansionStrategySelectorInput): ExpansionStrategy;
}
//# sourceMappingURL=expansion-strategy-selector.d.ts.map