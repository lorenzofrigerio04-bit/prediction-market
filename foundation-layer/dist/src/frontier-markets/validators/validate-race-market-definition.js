import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { RaceValidationStatus } from "../enums/race-validation-status.enum.js";
import { RACE_MARKET_DEFINITION_SCHEMA_ID } from "../schemas/race-market-definition.schema.js";
const validateRaceInvariants = (input) => {
    const issues = [];
    const activeTargets = input.race_targets.filter((target) => target.active);
    if (activeTargets.length < 2) {
        issues.push(errorIssue("RACE_ACTIVE_TARGETS_INSUFFICIENT", "/race_targets", "race must have at least two active targets"));
    }
    const uniqueKeys = new Set(input.race_targets.map((target) => target.target_key));
    if (uniqueKeys.size !== input.race_targets.length) {
        issues.push(errorIssue("RACE_TARGET_KEY_DUPLICATE", "/race_targets", "race target_key values must be unique"));
    }
    const shouldBeValid = issues.length === 0;
    if (shouldBeValid && input.race_validation_status === RaceValidationStatus.INVALID) {
        issues.push(errorIssue("RACE_STATUS_INCONSISTENT", "/race_validation_status", "race_validation_status invalid is inconsistent with valid invariants"));
    }
    if (!shouldBeValid && input.race_validation_status === RaceValidationStatus.VALID) {
        issues.push(errorIssue("RACE_STATUS_INCONSISTENT", "/race_validation_status", "race_validation_status valid is inconsistent with invariant failures"));
    }
    return issues;
};
export const validateRaceMarketDefinition = (input, options) => {
    const schemaValidator = requireSchemaValidator(RACE_MARKET_DEFINITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateRaceInvariants(input);
    return buildValidationReport("RaceMarketDefinition", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-race-market-definition.js.map