import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { OverrideType } from "../../enums/override-type.enum.js";
import type { ManualOverrideId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import type { OverrideScope } from "../../value-objects/override-scope.vo.js";
import type { AuditReferenceId } from "../../value-objects/audit-reference.vo.js";
import { createOverrideScope } from "../../value-objects/override-scope.vo.js";

export type ManualOverride = Readonly<{
  id: ManualOverrideId;
  version: EntityVersion;
  target_entity_type: string;
  target_entity_id: string;
  override_type: OverrideType;
  initiated_by: EditorialActorId;
  initiated_at: Timestamp;
  override_reason: string;
  override_scope: OverrideScope;
  expiration_nullable: Timestamp | null;
  audit_reference_id: AuditReferenceId;
}>;

export const createManualOverride = (input: ManualOverride): ManualOverride => {
  if (!Object.values(OverrideType).includes(input.override_type)) {
    throw new ValidationError("INVALID_MANUAL_OVERRIDE", "override_type is invalid");
  }
  if (input.override_reason.trim().length === 0) {
    throw new ValidationError("INVALID_MANUAL_OVERRIDE", "override_reason is required");
  }
  if (input.target_entity_type.trim().length === 0 || input.target_entity_id.trim().length === 0) {
    throw new ValidationError("INVALID_MANUAL_OVERRIDE", "target entity reference is required");
  }
  if (input.expiration_nullable !== null && Date.parse(input.expiration_nullable) <= Date.parse(input.initiated_at)) {
    throw new ValidationError(
      "INVALID_MANUAL_OVERRIDE",
      "expiration_nullable must be greater than initiated_at when present",
    );
  }
  return deepFreeze({
    ...input,
    override_scope: createOverrideScope(input.override_scope),
  });
};
