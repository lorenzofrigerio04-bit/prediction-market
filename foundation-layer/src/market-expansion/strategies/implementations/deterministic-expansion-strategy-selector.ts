import { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { StrategyType } from "../../enums/strategy-type.enum.js";
import { createExpansionStrategy } from "../entities/expansion-strategy.entity.js";
import type {
  ExpansionStrategySelector,
  ExpansionStrategySelectorInput,
} from "../interfaces/expansion-strategy-selector.js";
import { createExpansionStrategyId } from "../../value-objects/market-expansion-ids.vo.js";

const deriveStrategyType = (input: ExpansionStrategySelectorInput): StrategyType => {
  const relationCount = input.event_graph_context.reduce(
    (total, node) => total + node.incoming_relations.length + node.outgoing_relations.length,
    0,
  );
  if (relationCount >= 8) {
    return StrategyType.BALANCED;
  }
  return StrategyType.CONSERVATIVE;
};

export class DeterministicExpansionStrategySelector implements ExpansionStrategySelector {
  select(input: ExpansionStrategySelectorInput) {
    const strategyType = deriveStrategyType(input);
    const token = createDeterministicToken(`${input.canonical_event.id}|${strategyType}`);
    return createExpansionStrategy({
      id: createExpansionStrategyId(`mes_${token}str`),
      version: createEntityVersion(1),
      source_context_ref: input.canonical_event.id,
      strategy_type: strategyType,
      allowed_contract_types: [ContractType.BINARY, ContractType.SCALAR_BRACKET],
      max_satellite_count: strategyType === StrategyType.CONSERVATIVE ? 2 : 4,
      max_derivative_count: strategyType === StrategyType.CONSERVATIVE ? 1 : 3,
      anti_cannibalization_policy: "strict-non-overlap",
      expansion_notes_nullable: "strategy selected deterministically from event graph complexity",
    });
  }
}
