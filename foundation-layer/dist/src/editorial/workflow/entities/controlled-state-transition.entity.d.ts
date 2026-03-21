import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import type { ControlledStateTransitionId, EditorialActorId, AuditRecordId } from "../../value-objects/editorial-ids.vo.js";
export type ControlledStateTransition = Readonly<{
    id: ControlledStateTransitionId;
    version: EntityVersion;
    publishable_candidate_id: PublishableCandidateId;
    from_state: string;
    to_state: string;
    transition_at: Timestamp;
    transitioned_by: EditorialActorId;
    transition_reason: string;
    audit_record_id: AuditRecordId;
}>;
export declare const createControlledStateTransition: (input: ControlledStateTransition) => ControlledStateTransition;
//# sourceMappingURL=controlled-state-transition.entity.d.ts.map