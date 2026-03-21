import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { RevisionRecordId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import type { ChangedFieldReference } from "../../value-objects/changed-field.vo.js";
import { createChangedFieldCollection } from "../../value-objects/changed-field.vo.js";

export type RevisionRecord = Readonly<{
  id: RevisionRecordId;
  version: EntityVersion;
  target_entity_type: string;
  target_entity_id: string;
  revision_number: number;
  changed_fields: readonly ChangedFieldReference[];
  changed_by: EditorialActorId;
  changed_at: Timestamp;
  revision_reason: string;
}>;

export const createRevisionRecord = (input: RevisionRecord): RevisionRecord => {
  if (!Number.isInteger(input.revision_number) || input.revision_number < 1) {
    throw new ValidationError("INVALID_REVISION_RECORD", "revision_number must be a positive integer");
  }
  if (input.target_entity_type.trim().length === 0 || input.target_entity_id.trim().length === 0) {
    throw new ValidationError("INVALID_REVISION_RECORD", "target entity reference is required");
  }
  if (input.revision_reason.trim().length === 0) {
    throw new ValidationError("INVALID_REVISION_RECORD", "revision_reason is required");
  }
  return deepFreeze({
    ...input,
    changed_fields: createChangedFieldCollection(input.changed_fields),
  });
};
