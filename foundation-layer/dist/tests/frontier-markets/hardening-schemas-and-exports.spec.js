import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { requireSchemaValidator } from "../../src/validators/common/validation-result.js";
import { ADVANCED_CONTRACT_VALIDATION_REPORT_SCHEMA_ID, ADVANCED_MARKET_COMPATIBILITY_RESULT_SCHEMA_ID, ADVANCED_OUTCOME_GENERATION_RESULT_SCHEMA_ID, CONDITIONAL_MARKET_DEFINITION_SCHEMA_ID, DEPENDENCY_LINK_SCHEMA_ID, RACE_MARKET_DEFINITION_SCHEMA_ID, RACE_TARGET_SCHEMA_ID, SEQUENCE_MARKET_DEFINITION_SCHEMA_ID, SEQUENCE_TARGET_SCHEMA_ID, TRIGGER_CONDITION_SCHEMA_ID, } from "../../src/frontier-markets/index.js";
import * as foundation from "../../src/index.js";
describe("Frontier hardening: schema registry and public exports", () => {
    it("registers every frontier schema in AJV registry", () => {
        const schemaIds = [
            RACE_TARGET_SCHEMA_ID,
            RACE_MARKET_DEFINITION_SCHEMA_ID,
            SEQUENCE_TARGET_SCHEMA_ID,
            SEQUENCE_MARKET_DEFINITION_SCHEMA_ID,
            TRIGGER_CONDITION_SCHEMA_ID,
            CONDITIONAL_MARKET_DEFINITION_SCHEMA_ID,
            DEPENDENCY_LINK_SCHEMA_ID,
            ADVANCED_OUTCOME_GENERATION_RESULT_SCHEMA_ID,
            ADVANCED_CONTRACT_VALIDATION_REPORT_SCHEMA_ID,
            ADVANCED_MARKET_COMPATIBILITY_RESULT_SCHEMA_ID,
        ];
        for (const schemaId of schemaIds) {
            expect(() => requireSchemaValidator(schemaId)).not.toThrow();
        }
    });
    it("keeps root and namespace exports stable for frontier module", () => {
        expect(typeof foundation.validateRaceMarketDefinition).toBe("function");
        expect(typeof foundation.validateFrontierMarketCompatibility).toBe("function");
        expect(typeof foundation.frontierMarkets.validateRaceMarketDefinition).toBe("function");
        expect(typeof foundation.frontierMarkets.frontierMarketSchemas).toBe("object");
    });
    it("keeps published dist exports and schema registry aligned with frontier module", () => {
        const distIndex = readFileSync(new URL("../../dist/src/index.js", import.meta.url), "utf8");
        const distSchemasIndex = readFileSync(new URL("../../dist/src/schemas/index.js", import.meta.url), "utf8");
        expect(distIndex.includes('export * from "./frontier-markets/index.js";')).toBe(true);
        expect(distIndex.includes('export * as frontierMarkets from "./frontier-markets/index.js";')).toBe(true);
        expect(distSchemasIndex.includes("frontierMarketSchemas")).toBe(true);
    });
});
//# sourceMappingURL=hardening-schemas-and-exports.spec.js.map