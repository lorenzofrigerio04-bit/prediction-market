import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import { type LivePublicationContract } from "../entities/live-publication-contract.entity.js";
import type { BuildLiveContractInput, LiveContractBuilder } from "../interfaces/live-contract-builder.js";
export declare class DeterministicLiveContractBuilder implements LiveContractBuilder {
    buildLiveContract(input: BuildLiveContractInput): LivePublicationContract;
    validateSafetyChecks(safetyChecks: readonly string[]): ValidationReport;
}
//# sourceMappingURL=deterministic-live-contract-builder.d.ts.map