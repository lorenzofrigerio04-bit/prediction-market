import { ActivationPolicy } from "../../enums/activation-policy.enum.js";
import { ContractStatus } from "../../enums/contract-status.enum.js";
import type { PublicationMetadata } from "../../metadata/entities/publication-metadata.entity.js";
import { type CanonicalContractReference } from "../../value-objects/canonical-contract-reference.vo.js";
import { type ContractVersion } from "../../value-objects/contract-version.vo.js";
import { type LivePublicationContractId } from "../../value-objects/live-publication-contract-id.vo.js";
import type { PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { type SafetyCheck } from "../../value-objects/safety-check.vo.js";
export type LivePublicationContract = Readonly<{
    id: LivePublicationContractId;
    version: ContractVersion;
    publication_package_id: PublicationPackageId;
    canonical_contract_ref: CanonicalContractReference;
    publication_metadata: PublicationMetadata;
    activation_policy: ActivationPolicy;
    safety_checks: readonly SafetyCheck[];
    contract_status: ContractStatus;
}>;
export type LivePublicationContractInput = Readonly<{
    id: string;
    version: string;
    publication_package_id: string;
    canonical_contract_ref: string;
    publication_metadata: PublicationMetadata;
    activation_policy: ActivationPolicy;
    safety_checks: readonly string[];
    contract_status: ContractStatus;
}>;
export declare const createLivePublicationContract: (input: LivePublicationContractInput) => LivePublicationContract;
//# sourceMappingURL=live-publication-contract.entity.d.ts.map