import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { RevisionRecordId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import type { ChangedFieldReference } from "../../value-objects/changed-field.vo.js";
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
export declare const createRevisionRecord: (input: RevisionRecord) => RevisionRecord;
//# sourceMappingURL=revision-record.entity.d.ts.map