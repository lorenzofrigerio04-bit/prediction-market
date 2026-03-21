import { AdvancedCompatibilityStatus } from "../../enums/advanced-compatibility-status.enum.js";
import type { AdvancedContractCompatibilityAdapter } from "../interfaces/advanced-contract-compatibility-adapter.js";
import type { FrontierContract } from "../interfaces/advanced-contract-compatibility-adapter.js";
import type { AdvancedContractValidationReport } from "../../validation/entities/advanced-contract-validation-report.entity.js";
export declare class MarketDraftPipelineCompatibilityAdapter implements AdvancedContractCompatibilityAdapter {
    adapt(contract: FrontierContract, validation_report?: AdvancedContractValidationReport): Readonly<{
        id: import("../../index.js").AdvancedMarketCompatibilityResultId;
        target: import("../entities/advanced-market-compatibility-result.entity.js").CompatibilityTarget;
        status: AdvancedCompatibilityStatus;
        mapped_artifact: Readonly<Record<string, unknown>>;
        notes: readonly import("../../index.js").CompatibilityNote[];
    }>;
}
//# sourceMappingURL=market-draft-pipeline-compatibility.adapter.d.ts.map