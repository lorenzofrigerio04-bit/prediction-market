import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { ValidationError } from "../../../common/errors/validation-error.js";
import { DerivativeType } from "../../enums/derivative-type.enum.js";
import { createDerivativeMarketDefinition } from "../entities/derivative-market-definition.entity.js";
import type {
  DerivativeMarketGenerator,
  DerivativeMarketGeneratorInput,
} from "../interfaces/derivative-market-generator.js";
import { createDerivativeMarketDefinitionId } from "../../value-objects/market-expansion-ids.vo.js";

const TYPE_ORDER: readonly DerivativeType[] = [
  DerivativeType.DEPENDENCY,
  DerivativeType.CONDITIONAL,
  DerivativeType.RANGE,
  DerivativeType.SEQUENCE,
];

export class DeterministicDerivativeMarketGenerator implements DerivativeMarketGenerator {
  generate(input: DerivativeMarketGeneratorInput) {
    if (input.candidate_markets.length === 0) {
      throw new ValidationError(
        "DERIVATIVE_GENERATION_FAILED",
        "candidate_markets must include at least one market",
      );
    }
    const relationRefs = input.event_relations
      .filter((relation) => relation.source_event_id !== relation.target_event_id)
      .map((relation) => relation.id)
      .sort()
      .slice(0, input.strategy.max_derivative_count);
    return relationRefs.map((relationRef, index) => {
      const market = input.candidate_markets[index % input.candidate_markets.length]!;
      const token = createDeterministicToken(`${input.family_id}|${relationRef}|${market.id}`);
      return createDerivativeMarketDefinition({
        id: createDerivativeMarketDefinitionId(`mdd_${token}drv`),
        version: createEntityVersion(1),
        parent_family_id: input.family_id,
        source_relation_ref: String(relationRef),
        market_ref: market.id,
        derivative_type: TYPE_ORDER[index % TYPE_ORDER.length] ?? DerivativeType.DEPENDENCY,
        dependency_strength: 0.7,
        active: true,
      });
    });
  }
}
