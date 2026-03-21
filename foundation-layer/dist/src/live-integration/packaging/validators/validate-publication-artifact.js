import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { PUBLICATION_ARTIFACT_SCHEMA_ID } from "../../schemas/publication-artifact.schema.js";
const validatePublicationArtifactInvariants = (input) => {
    const issues = [];
    if (input.integrity_hash.trim().length === 0) {
        issues.push(errorIssue("INTEGRITY_HASH_REQUIRED", "/integrity_hash", "integrity_hash is required and cannot be empty"));
    }
    if (input.artifact_ref.trim().length === 0) {
        issues.push(errorIssue("ARTIFACT_REF_REQUIRED", "/artifact_ref", "artifact_ref is required"));
    }
    if (typeof input.required !== "boolean") {
        issues.push(errorIssue("ARTIFACT_REQUIRED_FLAG_INVALID", "/required", "required must be boolean"));
    }
    return issues;
};
export const validatePublicationArtifact = (input, options) => {
    const schemaValidator = requireSchemaValidator(PUBLICATION_ARTIFACT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validatePublicationArtifactInvariants(input);
    return buildValidationReport("PublicationArtifact", `${input.artifact_type}:${input.artifact_ref}`, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-publication-artifact.js.map