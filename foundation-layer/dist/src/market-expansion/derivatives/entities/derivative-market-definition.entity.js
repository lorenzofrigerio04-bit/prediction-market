import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { DerivativeType } from "../../enums/derivative-type.enum.js";
import { createDependencyStrength, createMarketRef, createRelationRef, } from "../../value-objects/market-expansion-shared.vo.js";
export const createDerivativeMarketDefinition = (input) => {
    if (!Object.values(DerivativeType).includes(input.derivative_type)) {
        throw new ValidationError("INVALID_DERIVATIVE_MARKET_DEFINITION", "derivative_type is invalid");
    }
    const source_relation_ref = createRelationRef(input.source_relation_ref);
    if (source_relation_ref.startsWith("invalid_")) {
        throw new ValidationError("INVALID_DERIVATIVE_MARKET_DEFINITION", "derivative cannot be active with invalid source_relation_ref");
    }
    return deepFreeze({
        ...input,
        source_relation_ref,
        market_ref: createMarketRef(input.market_ref),
        dependency_strength: createDependencyStrength(input.dependency_strength),
    });
};
//# sourceMappingURL=derivative-market-definition.entity.js.map