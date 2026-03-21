import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
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

export const createAuditRecord = (input: AuditRecord): AuditRecord => {
  if (!Object.values(ActionType).includes(input.action_type)) {
    throw new ValidationError("INVALID_AUDIT_RECORD", "action_type is invalid");
  }
  if (input.target_type.trim().length === 0 || input.target_id.trim().length === 0) {
    throw new ValidationError("INVALID_AUDIT_RECORD", "target_type and target_id are required");
  }
  if (input.action_payload_summary.trim().length < 8) {
    throw new ValidationError(
      "INVALID_AUDIT_RECORD",
      "action_payload_summary must be readable and at least 8 characters",
    );
  }
  if (input.reason_codes.length === 0) {
    throw new ValidationError("INVALID_AUDIT_RECORD", "reason_codes must contain at least one item");
  }
  return deepFreeze({
    ...input,
    reason_codes: deepFreeze([...input.reason_codes]),
  });
};
