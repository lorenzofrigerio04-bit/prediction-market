import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { TriggerType } from "../../enums/trigger-type.enum.js";
import { type TriggerPolicyNote } from "../../value-objects/frontier-text.vo.js";
export type UpstreamEventRefOrMarketRef = Readonly<{
    kind: "upstream_event";
    event_id: CanonicalEventIntelligenceId;
}> | Readonly<{
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
export declare const createTriggerCondition: (input: TriggerCondition) => TriggerCondition;
//# sourceMappingURL=trigger-condition.entity.d.ts.map