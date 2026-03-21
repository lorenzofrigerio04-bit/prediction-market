import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { GOLDEN_DATASET_ENTRY_SCHEMA_ID } from "../schemas/golden-dataset-entry.schema.js";
const validateGoldenDatasetEntryInvariants = (input) => {
    const issues = [];
    if (input.expected_invariants.length === 0) {
        issues.push(errorIssue("EMPTY_EXPECTED_INVARIANTS", "/expected_invariants", "GoldenDatasetEntry.expectedInvariants must not be empty"));
    }
    return issues;
};
export const validateGoldenDatasetEntry = (input, options) => {
    const schemaValidator = requireSchemaValidator(GOLDEN_DATASET_ENTRY_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateGoldenDatasetEntryInvariants(input);
    return buildValidationReport("GoldenDatasetEntry", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-golden-dataset-entry.js.map