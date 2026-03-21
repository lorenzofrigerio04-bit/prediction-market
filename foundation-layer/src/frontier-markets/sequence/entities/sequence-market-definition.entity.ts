import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { EventGraphNodeId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import { CompletionPolicy } from "../../enums/completion-policy.enum.js";
import { RequiredOrderPolicy } from "../../enums/required-order-policy.enum.js";
import { SequenceValidationStatus } from "../../enums/sequence-validation-status.enum.js";
import type { SequenceMarketDefinitionId } from "../../value-objects/frontier-market-ids.vo.js";
import { createSequenceTarget, type SequenceTarget } from "./sequence-target.entity.js";

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

export const createSequenceMarketDefinition = (input: SequenceMarketDefinition): SequenceMarketDefinition => {
  if (!Object.values(RequiredOrderPolicy).includes(input.required_order_policy)) {
    throw new ValidationError("INVALID_SEQUENCE_MARKET_DEFINITION", "required_order_policy is invalid");
  }
  if (!Object.values(CompletionPolicy).includes(input.completion_policy)) {
    throw new ValidationError("INVALID_SEQUENCE_MARKET_DEFINITION", "completion_policy is invalid");
  }
  if (!Object.values(SequenceValidationStatus).includes(input.sequence_validation_status)) {
    throw new ValidationError("INVALID_SEQUENCE_MARKET_DEFINITION", "sequence_validation_status is invalid");
  }
  if (input.sequence_targets.length < 2) {
    throw new ValidationError(
      "INVALID_SEQUENCE_MARKET_DEFINITION",
      "sequence_targets must have at least 2 items",
    );
  }
  return deepFreeze({
    ...input,
    sequence_targets: input.sequence_targets.map(createSequenceTarget),
    metadata: { ...input.metadata },
  });
};
