import { DerivativeType } from "../../enums/derivative-type.enum.js";
import type { DerivativeMarketGenerator, DerivativeMarketGeneratorInput } from "../interfaces/derivative-market-generator.js";
export declare class DeterministicDerivativeMarketGenerator implements DerivativeMarketGenerator {
    generate(input: DerivativeMarketGeneratorInput): Readonly<{
        id: import("../../index.js").DerivativeMarketDefinitionId;
        version: import("../../../index.js").EntityVersion;
        parent_family_id: import("../../index.js").MarketFamilyId;
        source_relation_ref: import("../../index.js").RelationRef;
        market_ref: import("../../index.js").MarketRef;
        derivative_type: DerivativeType;
        dependency_strength: import("../../index.js").DerivativeDependencyStrength;
        active: boolean;
    }>[];
}
//# sourceMappingURL=deterministic-derivative-market-generator.d.ts.map