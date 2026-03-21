import { BonusType } from "../enums/bonus-type.enum.js";
import { EligibilityStatus } from "../enums/eligibility-status.enum.js";
export const BONUS_ELIGIBILITY_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/bonus-eligibility.schema.json";
export const bonusEligibilitySchema = {
    $id: BONUS_ELIGIBILITY_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["id", "version", "target_owner_ref", "bonus_type", "eligibility_status", "evaluated_at", "blocking_reasons", "supporting_refs"],
    properties: {
        id: { type: "string", pattern: "^vbe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        target_owner_ref: { type: "string", minLength: 1 },
        bonus_type: { type: "string", enum: Object.values(BonusType) },
        eligibility_status: { type: "string", enum: Object.values(EligibilityStatus) },
        evaluated_at: { type: "string", format: "date-time" },
        blocking_reasons: { type: "array", items: { type: "string", minLength: 1 } },
        supporting_refs: { type: "array", items: { type: "string", minLength: 1 } },
    },
};
//# sourceMappingURL=bonus-eligibility.schema.js.map