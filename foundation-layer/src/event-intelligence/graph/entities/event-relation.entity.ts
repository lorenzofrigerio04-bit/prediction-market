import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { CanonicalEventIntelligenceId, EventRelationId } from "../../value-objects/event-intelligence-ids.vo.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
import { RelationType } from "../enums/relation-type.enum.js";

export type EventRelation = Readonly<{
  id: EventRelationId;
  source_event_id: CanonicalEventIntelligenceId;
  target_event_id: CanonicalEventIntelligenceId;
  relation_type: RelationType;
  relation_confidence: number;
}>;

const SELF_RELATION_ALLOWED_TYPES = new Set<RelationType>([RelationType.TOPIC_SIMILARITY]);

export const createEventRelation = (input: EventRelation): EventRelation => {
  assertConfidence01(input.relation_confidence, "relation_confidence");
  if (
    input.source_event_id === input.target_event_id &&
    !SELF_RELATION_ALLOWED_TYPES.has(input.relation_type)
  ) {
    throw new ValidationError(
      "INVALID_EVENT_RELATION",
      "self relation is not allowed for this relation_type",
      { relation_type: input.relation_type },
    );
  }
  return deepFreeze(input);
};
