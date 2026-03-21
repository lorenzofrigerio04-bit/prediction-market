import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { StrategyType } from "../../enums/strategy-type.enum.js";
import type { ExpansionStrategyId } from "../../value-objects/market-expansion-ids.vo.js";
import { type AntiCannibalizationPolicy, type ExpansionNote, type SourceContextRef } from "../../value-objects/market-expansion-shared.vo.js";
export type ExpansionStrategy = Readonly<{
    id: ExpansionStrategyId;
    version: EntityVersion;
    source_context_ref: SourceContextRef;
    strategy_type: StrategyType;
    allowed_contract_types: readonly ContractType[];
    max_satellite_count: number;
    max_derivative_count: number;
    anti_cannibalization_policy: AntiCannibalizationPolicy;
    expansion_notes_nullable: ExpansionNote | null;
}>;
export declare const createExpansionStrategy: (input: ExpansionStrategy) => ExpansionStrategy;
//# sourceMappingURL=expansion-strategy.entity.d.ts.map