import { describe, expect, it } from "vitest";
import { requireSchemaValidator } from "../../src/validators/common/validation-result.js";
import { CANNIBALIZATION_CHECK_RESULT_SCHEMA_ID, DERIVATIVE_MARKET_DEFINITION_SCHEMA_ID, EXPANSION_STRATEGY_SCHEMA_ID, EXPANSION_VALIDATION_REPORT_SCHEMA_ID, FAMILY_GENERATION_RESULT_SCHEMA_ID, FLAGSHIP_MARKET_SELECTION_SCHEMA_ID, MARKET_FAMILY_COMPATIBILITY_RESULT_SCHEMA_ID, MARKET_FAMILY_SCHEMA_ID, MARKET_RELATIONSHIP_SCHEMA_ID, SATELLITE_MARKET_DEFINITION_SCHEMA_ID, } from "../../src/market-expansion/index.js";
import * as foundation from "../../src/index.js";
describe("Market Expansion hardening: schema registry and exports", () => {
    it("registers every market-expansion schema in AJV registry", () => {
        const schemaIds = [
            MARKET_FAMILY_SCHEMA_ID,
            FLAGSHIP_MARKET_SELECTION_SCHEMA_ID,
            SATELLITE_MARKET_DEFINITION_SCHEMA_ID,
            DERIVATIVE_MARKET_DEFINITION_SCHEMA_ID,
            MARKET_RELATIONSHIP_SCHEMA_ID,
            EXPANSION_STRATEGY_SCHEMA_ID,
            CANNIBALIZATION_CHECK_RESULT_SCHEMA_ID,
            EXPANSION_VALIDATION_REPORT_SCHEMA_ID,
            FAMILY_GENERATION_RESULT_SCHEMA_ID,
            MARKET_FAMILY_COMPATIBILITY_RESULT_SCHEMA_ID,
        ];
        for (const schemaId of schemaIds) {
            expect(() => requireSchemaValidator(schemaId)).not.toThrow();
        }
    });
    it("keeps root and namespace exports stable for market-expansion module", () => {
        expect(typeof foundation.validateMarketFamily).toBe("function");
        expect(typeof foundation.validateMarketFamilyCompatibility).toBe("function");
        expect(typeof foundation.marketExpansion.validateMarketFamily).toBe("function");
        expect(typeof foundation.marketExpansion.marketExpansionSchemas).toBe("object");
    });
});
//# sourceMappingURL=hardening-schemas-and-exports.spec.js.map