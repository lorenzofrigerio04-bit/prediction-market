export declare enum ContractType {
    BINARY = "binary",
    MULTI_OUTCOME = "multi_outcome",
    SCALAR_BRACKET = "scalar_bracket",
    RACE = "race",
    SEQUENCE = "sequence",
    CONDITIONAL = "conditional"
}
export declare const OPERATIVE_CONTRACT_TYPES: readonly [ContractType.BINARY, ContractType.MULTI_OUTCOME, ContractType.SCALAR_BRACKET];
export declare const FUTURE_CONTRACT_TYPES: readonly [ContractType.RACE, ContractType.SEQUENCE, ContractType.CONDITIONAL];
export type OperativeContractType = (typeof OPERATIVE_CONTRACT_TYPES)[number];
export type FutureContractType = (typeof FUTURE_CONTRACT_TYPES)[number];
//# sourceMappingURL=contract-type.enum.d.ts.map