import { AdvancedValidationStatus } from "../enums/advanced-validation-status.enum.js";
export declare const ADVANCED_CONTRACT_VALIDATION_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/advanced-contract-validation-report.schema.json";
export declare const advancedContractValidationReportSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/advanced-contract-validation-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "contract_type", "validation_status", "blocking_issues", "warnings", "checked_invariants", "compatibility_notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fvr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly contract_type: {
            readonly type: "string";
            readonly enum: readonly [import("../../index.js").ContractType.RACE, import("../../index.js").ContractType.SEQUENCE, import("../../index.js").ContractType.CONDITIONAL];
        };
        readonly validation_status: {
            readonly type: "string";
            readonly enum: AdvancedValidationStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly checked_invariants: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "passed", "message"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly passed: {
                        readonly type: "boolean";
                    };
                    readonly message: {
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
//# sourceMappingURL=advanced-contract-validation-report.schema.d.ts.map