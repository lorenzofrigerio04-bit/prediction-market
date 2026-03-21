import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { OBSERVATION_INTERPRETATION_SCHEMA_ID } from "../schemas/observation-interpretation.schema.js";
const validateObservationInterpretationInvariants = (input) => {
    const issues = [];
    if (input.interpreted_entities.length === 0 &&
        input.interpreted_dates.length === 0 &&
        input.interpreted_numbers.length === 0 &&
        input.interpreted_claims.length === 0) {
        issues.push(errorIssue("EMPTY_INTERPRETATION", "/interpreted_entities", "at least one interpreted_* collection must contain data"));
    }
    return issues;
};
export const validateObservationInterpretation = (input, options) => {
    const schemaValidator = requireSchemaValidator(OBSERVATION_INTERPRETATION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateObservationInterpretationInvariants(input)];
    return buildValidationReport("ObservationInterpretation", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-observation-interpretation.js.map