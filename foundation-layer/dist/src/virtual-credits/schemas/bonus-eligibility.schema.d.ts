import { BonusType } from "../enums/bonus-type.enum.js";
import { EligibilityStatus } from "../enums/eligibility-status.enum.js";
export declare const BONUS_ELIGIBILITY_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/bonus-eligibility.schema.json";
export declare const bonusEligibilitySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/bonus-eligibility.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_owner_ref", "bonus_type", "eligibility_status", "evaluated_at", "blocking_reasons", "supporting_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vbe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly bonus_type: {
            readonly type: "string";
            readonly enum: BonusType[];
        };
        readonly eligibility_status: {
            readonly type: "string";
            readonly enum: EligibilityStatus[];
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=bonus-eligibility.schema.d.ts.map