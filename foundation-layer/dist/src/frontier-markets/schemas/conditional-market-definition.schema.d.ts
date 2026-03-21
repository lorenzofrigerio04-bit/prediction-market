import { ContractType } from "../../market-design/enums/contract-type.enum.js";
import { ActivationPolicy } from "../enums/activation-policy.enum.js";
import { ConditionalValidationStatus } from "../enums/conditional-validation-status.enum.js";
import { InvalidationPolicy } from "../enums/invalidation-policy.enum.js";
export declare const CONDITIONAL_MARKET_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/conditional-market-definition.schema.json";
export declare const conditionalMarketDefinitionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/conditional-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "trigger_condition", "dependent_contract_type", "dependent_outcome_schema", "activation_policy", "invalidation_policy", "deadline_resolution", "conditional_validation_status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fco_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly trigger_condition: {
            readonly $ref: "https://market-design-engine.dev/schemas/frontier-markets/trigger-condition.schema.json";
        };
        readonly dependent_contract_type: {
            readonly type: "string";
            readonly enum: ContractType[];
        };
        readonly dependent_outcome_schema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["schema_version", "required_outcome_keys"];
            readonly properties: {
                readonly schema_version: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly required_outcome_keys: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly activation_policy: {
            readonly type: "string";
            readonly enum: ActivationPolicy.EXPLICIT_TRIGGER_ONLY[];
        };
        readonly invalidation_policy: {
            readonly type: "string";
            readonly enum: InvalidationPolicy[];
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly conditional_validation_status: {
            readonly type: "string";
            readonly enum: ConditionalValidationStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: readonly ["string", "number", "boolean", "null"];
            };
        };
    };
};
//# sourceMappingURL=conditional-market-definition.schema.d.ts.map