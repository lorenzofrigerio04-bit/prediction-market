import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { TriggerType } from "../../enums/trigger-type.enum.js";
import {
  createTriggerPolicyNote,
  type TriggerPolicyNote,
} from "../../value-objects/frontier-text.vo.js";

export type UpstreamEventRefOrMarketRef =
  | Readonly<{
      kind: "upstream_event";
      event_id: CanonicalEventIntelligenceId;
    }>
  | Readonly<{
      kind: "upstream_market";
      market_id: string;
    }>;

export type TriggerCondition = Readonly<{
  trigger_type: TriggerType;
  upstream_event_ref_or_market_ref: UpstreamEventRefOrMarketRef;
  triggering_outcome: string;
  trigger_deadline_nullable: Timestamp | null;
  trigger_policy_notes: readonly TriggerPolicyNote[];
}>;

export const createTriggerCondition = (input: TriggerCondition): TriggerCondition => {
  if (!Object.values(TriggerType).includes(input.trigger_type)) {
    throw new ValidationError("INVALID_TRIGGER_CONDITION", "trigger_type is invalid");
  }
  if (input.triggering_outcome.trim().length === 0) {
    throw new ValidationError("INVALID_TRIGGER_CONDITION", "triggering_outcome must be non-empty");
  }
  if (input.upstream_event_ref_or_market_ref.kind === "upstream_market") {
    if (input.upstream_event_ref_or_market_ref.market_id.trim().length === 0) {
      throw new ValidationError("INVALID_TRIGGER_CONDITION", "market_id must be non-empty");
    }
  }
  return deepFreeze({
    ...input,
    triggering_outcome: input.triggering_outcome.trim(),
    trigger_policy_notes: input.trigger_policy_notes.map(createTriggerPolicyNote),
    upstream_event_ref_or_market_ref:
      input.upstream_event_ref_or_market_ref.kind === "upstream_market"
        ? {
            ...input.upstream_event_ref_or_market_ref,
            market_id: input.upstream_event_ref_or_market_ref.market_id.trim(),
          }
        : input.upstream_event_ref_or_market_ref,
  });
};
