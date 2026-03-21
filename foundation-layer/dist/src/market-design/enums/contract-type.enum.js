export var ContractType;
(function (ContractType) {
    ContractType["BINARY"] = "binary";
    ContractType["MULTI_OUTCOME"] = "multi_outcome";
    ContractType["SCALAR_BRACKET"] = "scalar_bracket";
    ContractType["RACE"] = "race";
    ContractType["SEQUENCE"] = "sequence";
    ContractType["CONDITIONAL"] = "conditional";
})(ContractType || (ContractType = {}));
export const OPERATIVE_CONTRACT_TYPES = [
    ContractType.BINARY,
    ContractType.MULTI_OUTCOME,
    ContractType.SCALAR_BRACKET,
];
export const FUTURE_CONTRACT_TYPES = [
    ContractType.RACE,
    ContractType.SEQUENCE,
    ContractType.CONDITIONAL,
];
//# sourceMappingURL=contract-type.enum.js.map