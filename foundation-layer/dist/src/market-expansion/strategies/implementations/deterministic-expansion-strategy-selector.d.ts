import { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { StrategyType } from "../../enums/strategy-type.enum.js";
import type { ExpansionStrategySelector, ExpansionStrategySelectorInput } from "../interfaces/expansion-strategy-selector.js";
export declare class DeterministicExpansionStrategySelector implements ExpansionStrategySelector {
    select(input: ExpansionStrategySelectorInput): Readonly<{
        id: import("../../index.js").ExpansionStrategyId;
        version: import("../../../index.js").EntityVersion;
        source_context_ref: import("../../index.js").SourceContextRef;
        strategy_type: StrategyType;
        allowed_contract_types: readonly ContractType[];
        max_satellite_count: number;
        max_derivative_count: number;
        anti_cannibalization_policy: import("../../index.js").AntiCannibalizationPolicy;
        expansion_notes_nullable: import("../../index.js").ExpansionNote | null;
    }>;
}
//# sourceMappingURL=deterministic-expansion-strategy-selector.d.ts.map