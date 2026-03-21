import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import type { ActivationPolicy } from "../../enums/activation-policy.enum.js";
import type { ContractStatus } from "../../enums/contract-status.enum.js";
import type { PublicationMetadata } from "../../metadata/entities/publication-metadata.entity.js";
import type { PublicationPackage } from "../../packaging/entities/publication-package.entity.js";
import type { LivePublicationContract } from "../entities/live-publication-contract.entity.js";
export type BuildLiveContractInput = Readonly<{
    publication_package: PublicationPackage;
    publication_metadata: PublicationMetadata;
    canonical_contract_ref: string;
    activation_policy: ActivationPolicy;
    safety_checks: readonly string[];
    version: string;
    contract_status: ContractStatus;
}>;
export interface LiveContractBuilder {
    buildLiveContract(input: BuildLiveContractInput): LivePublicationContract;
    validateSafetyChecks(safetyChecks: readonly string[]): ValidationReport;
}
//# sourceMappingURL=live-contract-builder.d.ts.map