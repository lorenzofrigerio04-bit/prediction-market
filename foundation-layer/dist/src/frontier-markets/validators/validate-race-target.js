import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { RACE_TARGET_SCHEMA_ID } from "../schemas/race-target.schema.js";
export const validateRaceTarget = (input, options) => {
    const schemaValidator = requireSchemaValidator(RACE_TARGET_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("RaceTarget", input.target_key, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-race-target.js.map