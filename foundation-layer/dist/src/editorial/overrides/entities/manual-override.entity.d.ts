import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { OverrideType } from "../../enums/override-type.enum.js";
import type { ManualOverrideId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";
import type { OverrideScope } from "../../value-objects/override-scope.vo.js";
import type { AuditReferenceId } from "../../value-objects/audit-reference.vo.js";
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
export declare const createManualOverride: (input: ManualOverride) => ManualOverride;
//# sourceMappingURL=manual-override.entity.d.ts.map