import { FamilyCompatibilityStatus } from "../../enums/family-compatibility-status.enum.js";
import type { FamilyCompatibilityAdapter } from "../interfaces/family-compatibility-adapter.js";
import type { MarketFamily } from "../../families/entities/market-family.entity.js";
import type { ExpansionValidationReport } from "../../validation/entities/expansion-validation-report.entity.js";
export declare class FamilyEditorialCompatibilityAdapter implements FamilyCompatibilityAdapter {
    adapt(family: MarketFamily, validation_report?: ExpansionValidationReport): Readonly<{
        id: import("../../index.js").MarketFamilyCompatibilityResultId;
        target: import("./market-family-compatibility-result.entity.js").FamilyCompatibilityTarget;
        status: FamilyCompatibilityStatus;
        mapped_artifact: Readonly<Record<string, unknown>>;
        notes: readonly import("../../index.js").ExpansionNote[];
    }>;
}
//# sourceMappingURL=family-editorial-compatibility.adapter.d.ts.map