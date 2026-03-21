import { ExpansionValidationStatus } from "../enums/expansion-validation-status.enum.js";
export declare const EXPANSION_VALIDATION_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/expansion-validation-report.schema.json";
export declare const expansionValidationReportSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/expansion-validation-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "family_id", "validation_status", "blocking_issues", "warnings", "checked_invariants", "compatibility_notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mvr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly validation_status: {
            readonly type: "string";
            readonly enum: ExpansionValidationStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly checked_invariants: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "passed", "description"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly passed: {
                        readonly type: "boolean";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly compatibility_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=expansion-validation-report.schema.d.ts.map