import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import type { PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import type { PublicationHandoff } from "../entities/publication-handoff.entity.js";
export type CreateHandoffInput = Readonly<{
    publication_package_id: PublicationPackageId;
    initiated_by: string;
    initiated_at: string;
    delivery_notes: readonly string[];
    audit_ref: string;
    version: string;
}>;
export interface PublicationHandoffManager {
    createHandoff(input: CreateHandoffInput): PublicationHandoff;
    validateAuditLinkage(input: PublicationHandoff): ValidationReport;
}
//# sourceMappingURL=publication-handoff-manager.d.ts.map