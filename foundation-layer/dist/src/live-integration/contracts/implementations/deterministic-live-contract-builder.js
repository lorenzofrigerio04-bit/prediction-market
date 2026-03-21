import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport } from "../../../validators/common/validation-result.js";
import { resolveGeneratedAt } from "../../../validators/common/validation-result.js";
import { ContractStatus } from "../../enums/contract-status.enum.js";
import { PackageStatus } from "../../enums/package-status.enum.js";
import { createLivePublicationContract } from "../entities/live-publication-contract.entity.js";
import { createLivePublicationContractId } from "../../value-objects/live-publication-contract-id.vo.js";
export class DeterministicLiveContractBuilder {
    buildLiveContract(input) {
        const token = createDeterministicToken(`${input.publication_package.id}|${input.canonical_contract_ref}|${input.version}`);
        const normalizedStatus = input.publication_package.package_status === PackageStatus.INVALID && input.contract_status === ContractStatus.READY
            ? ContractStatus.BLOCKED
            : input.contract_status;
        return createLivePublicationContract({
            id: createLivePublicationContractId(`lpct_${token}ctr`),
            version: input.version,
            publication_package_id: input.publication_package.id,
            canonical_contract_ref: input.canonical_contract_ref,
            publication_metadata: input.publication_metadata,
            activation_policy: input.activation_policy,
            safety_checks: input.safety_checks,
            contract_status: normalizedStatus,
        });
    }
    validateSafetyChecks(safetyChecks) {
        const issues = safetyChecks
            .map((value, index) => value.trim().length === 0
            ? errorIssue("SAFETY_CHECK_EMPTY", `/safety_checks/${index}`, "safety checks must be non-empty")
            : null)
            .filter((item) => item !== null);
        return buildValidationReport("SafetyChecks", "safety_checks", issues, resolveGeneratedAt(undefined));
    }
}
//# sourceMappingURL=deterministic-live-contract-builder.js.map