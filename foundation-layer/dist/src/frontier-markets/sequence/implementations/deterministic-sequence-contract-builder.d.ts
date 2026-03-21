import { CompletionPolicy } from "../../enums/completion-policy.enum.js";
import { RequiredOrderPolicy } from "../../enums/required-order-policy.enum.js";
import { SequenceValidationStatus } from "../../enums/sequence-validation-status.enum.js";
import type { SequenceContractBuilder, SequenceContractBuilderInput } from "../interfaces/sequence-contract-builder.js";
export declare class DeterministicSequenceContractBuilder implements SequenceContractBuilder {
    build(input: SequenceContractBuilderInput): Readonly<{
        id: import("../../index.js").SequenceMarketDefinitionId;
        version: import("../../../index.js").EntityVersion;
        parent_event_graph_context_id: import("../../../event-intelligence/index.js").EventGraphNodeId;
        sequence_targets: readonly import("../entities/sequence-target.entity.js").SequenceTarget[];
        required_order_policy: RequiredOrderPolicy;
        completion_policy: CompletionPolicy;
        deadline_resolution: import("../../../index.js").DeadlineResolution;
        sequence_validation_status: SequenceValidationStatus;
        metadata: import("../entities/sequence-market-definition.entity.js").SequenceMarketDefinitionMetadata;
    }>;
}
//# sourceMappingURL=deterministic-sequence-contract-builder.d.ts.map