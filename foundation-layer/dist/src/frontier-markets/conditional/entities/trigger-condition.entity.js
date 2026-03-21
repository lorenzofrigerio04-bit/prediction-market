import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { TriggerType } from "../../enums/trigger-type.enum.js";
import { createTriggerPolicyNote, } from "../../value-objects/frontier-text.vo.js";
export const createTriggerCondition = (input) => {
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
        upstream_event_ref_or_market_ref: input.upstream_event_ref_or_market_ref.kind === "upstream_market"
            ? {
                ...input.upstream_event_ref_or_market_ref,
                market_id: input.upstream_event_ref_or_market_ref.market_id.trim(),
            }
            : input.upstream_event_ref_or_market_ref,
    });
};
//# sourceMappingURL=trigger-condition.entity.js.map