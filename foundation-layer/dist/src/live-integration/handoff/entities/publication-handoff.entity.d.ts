import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { HandoffStatus } from "../../enums/handoff-status.enum.js";
import { type AuditReference } from "../../value-objects/audit-reference.vo.js";
import { type ContractVersion } from "../../value-objects/contract-version.vo.js";
import { type DeliveryNote } from "../../value-objects/delivery-note.vo.js";
import { type PublicationHandoffId } from "../../value-objects/publication-handoff-id.vo.js";
import type { PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
export type PublicationHandoff = Readonly<{
    id: PublicationHandoffId;
    version: ContractVersion;
    publication_package_id: PublicationPackageId;
    handoff_status: HandoffStatus;
    initiated_by: string;
    initiated_at: Timestamp;
    delivery_notes: readonly DeliveryNote[];
    audit_ref: AuditReference;
}>;
export type PublicationHandoffInput = Readonly<{
    id: string;
    version: string;
    publication_package_id: string;
    handoff_status: HandoffStatus;
    initiated_by: string;
    initiated_at: string;
    delivery_notes: readonly string[];
    audit_ref: string;
}>;
export declare const createPublicationHandoff: (input: PublicationHandoffInput) => PublicationHandoff;
//# sourceMappingURL=publication-handoff.entity.d.ts.map