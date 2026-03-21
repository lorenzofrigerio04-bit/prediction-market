import { CompletionPolicy } from "../../enums/completion-policy.enum.js";
import { RequiredOrderPolicy } from "../../enums/required-order-policy.enum.js";
import { SequenceValidationStatus } from "../../enums/sequence-validation-status.enum.js";
import { createSequenceMarketDefinition } from "../entities/sequence-market-definition.entity.js";
import type {
  SequenceContractBuilder,
  SequenceContractBuilderInput,
} from "../interfaces/sequence-contract-builder.js";
import { createSequenceMarketDefinitionId } from "../../value-objects/frontier-market-ids.vo.js";

const sortTargetsDeterministically = (input: SequenceContractBuilderInput) =>
  [...input.sequence_targets].sort((left, right) => left.target_key.localeCompare(right.target_key));

export class DeterministicSequenceContractBuilder implements SequenceContractBuilder {
  build(input: SequenceContractBuilderInput) {
    return createSequenceMarketDefinition({
      id: createSequenceMarketDefinitionId(input.id),
      version: input.version,
      parent_event_graph_context_id: input.parent_event_graph_context_id,
      sequence_targets: sortTargetsDeterministically(input),
      required_order_policy: input.required_order_policy ?? RequiredOrderPolicy.STRICT,
      completion_policy: input.completion_policy ?? CompletionPolicy.ALL_REQUIRED,
      deadline_resolution: input.deadline_resolution,
      sequence_validation_status: input.sequence_validation_status ?? SequenceValidationStatus.REVIEW_REQUIRED,
      metadata: input.metadata ?? {},
    });
  }
}
