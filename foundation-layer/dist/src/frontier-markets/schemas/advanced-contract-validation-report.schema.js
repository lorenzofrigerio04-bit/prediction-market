import { FUTURE_CONTRACT_TYPES } from "../../market-design/enums/contract-type.enum.js";
import { AdvancedValidationStatus } from "../enums/advanced-validation-status.enum.js";
export const ADVANCED_CONTRACT_VALIDATION_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/advanced-contract-validation-report.schema.json";
export const advancedContractValidationReportSchema = {
    $id: ADVANCED_CONTRACT_VALIDATION_REPORT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "contract_type",
        "validation_status",
        "blocking_issues",
        "warnings",
        "checked_invariants",
        "compatibility_notes",
    ],
    properties: {
        id: { type: "string", pattern: "^fvr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        contract_type: { type: "string", enum: [...FUTURE_CONTRACT_TYPES] },
        validation_status: { type: "string", enum: Object.values(AdvancedValidationStatus) },
        blocking_issues: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["code", "message", "path"],
                properties: {
                    code: { type: "string", minLength: 1 },
                    message: { type: "string", minLength: 1 },
                    path: { type: "string", minLength: 1 },
                },
            },
        },
        warnings: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["code", "message", "path"],
                properties: {
                    code: { type: "string", minLength: 1 },
                    message: { type: "string", minLength: 1 },
                    path: { type: "string", minLength: 1 },
                },
            },
        },
        checked_invariants: {
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                additionalProperties: false,
                required: ["code", "passed", "message"],
                properties: {
                    code: { type: "string", minLength: 1 },
                    passed: { type: "boolean" },
                    message: { type: "string", minLength: 1 },
                },
            },
        },
        compatibility_notes: {
            type: "array",
            items: { type: "string", minLength: 1 },
        },
    },
};
//# sourceMappingURL=advanced-contract-validation-report.schema.js.map