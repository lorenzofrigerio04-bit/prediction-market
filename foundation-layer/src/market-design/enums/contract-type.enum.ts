export enum ContractType {
  BINARY = "binary",
  MULTI_OUTCOME = "multi_outcome",
  SCALAR_BRACKET = "scalar_bracket",
  RACE = "race",
  SEQUENCE = "sequence",
  CONDITIONAL = "conditional",
}

export const OPERATIVE_CONTRACT_TYPES = [
  ContractType.BINARY,
  ContractType.MULTI_OUTCOME,
  ContractType.SCALAR_BRACKET,
] as const;

export const FUTURE_CONTRACT_TYPES = [
  ContractType.RACE,
  ContractType.SEQUENCE,
  ContractType.CONDITIONAL,
] as const;

export type OperativeContractType = (typeof OPERATIVE_CONTRACT_TYPES)[number];
export type FutureContractType = (typeof FUTURE_CONTRACT_TYPES)[number];
