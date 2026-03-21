import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { ActionType } from "../../enums/action-type.enum.js";
import type { ReasonCode } from "../../enums/reason-code.enum.js";
import type { AuditRecordId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import type { AuditCorrelationId } from "../../value-objects/audit-reference.vo.js";
export type AuditRecord = Readonly<{
    id: AuditRecordId;
    version: EntityVersion;
    actor_id: EditorialActorId;
    action_type: ActionType;
    target_type: string;
    target_id: string;
    action_timestamp: Timestamp;
    action_payload_summary: string;
    reason_codes: readonly ReasonCode[];
    correlation_id: AuditCorrelationId;
}>;
export declare const createAuditRecord: (input: AuditRecord) => AuditRecord;
//# sourceMappingURL=audit-record.entity.d.ts.map