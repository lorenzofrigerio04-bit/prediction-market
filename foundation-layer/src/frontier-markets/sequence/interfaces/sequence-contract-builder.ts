import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { EventGraphNodeId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import type { CompletionPolicy } from "../../enums/completion-policy.enum.js";
import type { RequiredOrderPolicy } from "../../enums/required-order-policy.enum.js";
import type { SequenceValidationStatus } from "../../enums/sequence-validation-status.enum.js";
import type { SequenceMarketDefinition } from "../entities/sequence-market-definition.entity.js";
import type { SequenceTarget } from "../entities/sequence-target.entity.js";

export type SequenceContractBuilderInput = Readonly<{
  id: string;
  version: EntityVersion;
  parent_event_graph_context_id: EventGraphNodeId;
  sequence_targets: readonly SequenceTarget[];
  required_order_policy: RequiredOrderPolicy;
  completion_policy: CompletionPolicy;
  deadline_resolution: DeadlineResolution;
  sequence_validation_status?: SequenceValidationStatus;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}>;

export interface SequenceContractBuilder {
  build(input: SequenceContractBuilderInput): SequenceMarketDefinition;
}
