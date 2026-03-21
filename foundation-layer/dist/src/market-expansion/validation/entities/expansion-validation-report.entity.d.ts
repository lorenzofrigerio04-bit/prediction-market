import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { ExpansionValidationStatus } from "../../enums/expansion-validation-status.enum.js";
import type { ExpansionValidationReportId, MarketFamilyId } from "../../value-objects/market-expansion-ids.vo.js";
import { type ExpansionNote } from "../../value-objects/market-expansion-shared.vo.js";
export type CheckedInvariant = Readonly<{
    code: string;
    passed: boolean;
    description: string;
}>;
export type ExpansionValidationReport = Readonly<{
    id: ExpansionValidationReportId;
    version: EntityVersion;
    family_id: MarketFamilyId;
    validation_status: ExpansionValidationStatus;
    blocking_issues: readonly ExpansionNote[];
    warnings: readonly ExpansionNote[];
    checked_invariants: readonly CheckedInvariant[];
    compatibility_notes: readonly ExpansionNote[];
}>;
export declare const createExpansionValidationReport: (input: ExpansionValidationReport) => ExpansionValidationReport;
//# sourceMappingURL=expansion-validation-report.entity.d.ts.map