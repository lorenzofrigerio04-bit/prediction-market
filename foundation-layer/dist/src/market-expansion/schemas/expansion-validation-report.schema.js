import { ExpansionValidationStatus } from "../enums/expansion-validation-status.enum.js";
export const EXPANSION_VALIDATION_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/expansion-validation-report.schema.json";
export const expansionValidationReportSchema = {
    $id: EXPANSION_VALIDATION_REPORT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "family_id",
        "validation_status",
        "blocking_issues",
        "warnings",
        "checked_invariants",
        "compatibility_notes",
    ],
    properties: {
        id: { type: "string", pattern: "^mvr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        family_id: { type: "string", pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        validation_status: { type: "string", enum: Object.values(ExpansionValidationStatus) },
        blocking_issues: { type: "array", items: { type: "string", minLength: 1 } },
        warnings: { type: "array", items: { type: "string", minLength: 1 } },
        checked_invariants: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["code", "passed", "description"],
                properties: {
                    code: { type: "string", minLength: 1 },
                    passed: { type: "boolean" },
                    description: { type: "string", minLength: 1 },
                },
            },
        },
        compatibility_notes: { type: "array", items: { type: "string", minLength: 1 } },
    },
};
//# sourceMappingURL=expansion-validation-report.schema.js.map