import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { PackageStatus } from "../../enums/package-status.enum.js";
import { PUBLICATION_PACKAGE_SCHEMA_ID } from "../../schemas/publication-package.schema.js";
const validatePublicationPackageInvariants = (input) => {
    const issues = [];
    if (input.publication_ready_artifact_id.trim().length === 0) {
        issues.push(errorIssue("PUBLICATION_READY_ARTIFACT_REQUIRED", "/publication_ready_artifact_id", "publication_ready_artifact_id is required"));
    }
    if (input.packaged_artifacts.length === 0) {
        issues.push(errorIssue("PACKAGED_ARTIFACTS_REQUIRED", "/packaged_artifacts", "publication package requires at least one artifact"));
    }
    for (const [index, artifact] of input.packaged_artifacts.entries()) {
        if (artifact.integrity_hash.trim().length === 0) {
            issues.push(errorIssue("ARTIFACT_INTEGRITY_HASH_REQUIRED", `/packaged_artifacts/${index}/integrity_hash`, "packaged artifact integrity_hash is required"));
        }
    }
    if (input.package_status === PackageStatus.READY_FOR_HANDOFF && input.packaged_artifacts.length === 0) {
        issues.push(errorIssue("PACKAGE_STATUS_CONTENT_MISMATCH", "/package_status", "READY_FOR_HANDOFF package must include artifacts"));
    }
    return issues;
};
export const validatePublicationPackage = (input, options) => {
    const schemaValidator = requireSchemaValidator(PUBLICATION_PACKAGE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validatePublicationPackageInvariants(input);
    return buildValidationReport("PublicationPackage", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-publication-package.js.map