import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { EventGraphNodeId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import { CompletionPolicy } from "../../enums/completion-policy.enum.js";
import { RequiredOrderPolicy } from "../../enums/required-order-policy.enum.js";
import { SequenceValidationStatus } from "../../enums/sequence-validation-status.enum.js";
import type { SequenceMarketDefinitionId } from "../../value-objects/frontier-market-ids.vo.js";
import { type SequenceTarget } from "./sequence-target.entity.js";
export type SequenceMarketDefinitionMetadata = Readonly<Record<string, string | number | boolean | null>>;
export type SequenceMarketDefinition = Readonly<{
    id: SequenceMarketDefinitionId;
    version: EntityVersion;
    parent_event_graph_context_id: EventGraphNodeId;
    sequence_targets: readonly SequenceTarget[];
    required_order_policy: RequiredOrderPolicy;
    completion_policy: CompletionPolicy;
    deadline_resolution: DeadlineResolution;
    sequence_validation_status: SequenceValidationStatus;
    metadata: SequenceMarketDefinitionMetadata;
}>;
export declare const createSequenceMarketDefinition: (input: SequenceMarketDefinition) => SequenceMarketDefinition;
//# sourceMappingURL=sequence-market-definition.entity.d.ts.map