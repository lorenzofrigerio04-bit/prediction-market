import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActivationPolicy } from "../../enums/activation-policy.enum.js";
import { ContractStatus } from "../../enums/contract-status.enum.js";
import type { PublicationMetadata } from "../../metadata/entities/publication-metadata.entity.js";
import { createPublicationMetadata } from "../../metadata/entities/publication-metadata.entity.js";
import {
  createCanonicalContractReference,
  type CanonicalContractReference,
} from "../../value-objects/canonical-contract-reference.vo.js";
import { createContractVersion, type ContractVersion } from "../../value-objects/contract-version.vo.js";
import {
  createLivePublicationContractId,
  type LivePublicationContractId,
} from "../../value-objects/live-publication-contract-id.vo.js";
import type { PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { createPublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { createSafetyCheck, type SafetyCheck } from "../../value-objects/safety-check.vo.js";

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

export const createLivePublicationContract = (
  input: LivePublicationContractInput,
): LivePublicationContract => {
  if (!Object.values(ActivationPolicy).includes(input.activation_policy)) {
    throw new ValidationError("INVALID_LIVE_PUBLICATION_CONTRACT", "activation_policy is invalid");
  }
  if (!Object.values(ContractStatus).includes(input.contract_status)) {
    throw new ValidationError("INVALID_LIVE_PUBLICATION_CONTRACT", "contract_status is invalid");
  }
  const safetyChecks = input.safety_checks.map(createSafetyCheck);
  if (input.contract_status === ContractStatus.READY && safetyChecks.length === 0) {
    throw new ValidationError(
      "INVALID_LIVE_PUBLICATION_CONTRACT",
      "READY contract requires at least one safety_check",
    );
  }
  return deepFreeze({
    id: createLivePublicationContractId(input.id),
    version: createContractVersion(input.version),
    publication_package_id: createPublicationPackageId(input.publication_package_id),
    canonical_contract_ref: createCanonicalContractReference(input.canonical_contract_ref),
    publication_metadata: createPublicationMetadata(input.publication_metadata),
    activation_policy: input.activation_policy,
    safety_checks: deepFreeze([...safetyChecks]),
    contract_status: input.contract_status,
  });
};
