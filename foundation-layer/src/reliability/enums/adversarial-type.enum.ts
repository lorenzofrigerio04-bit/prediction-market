export enum AdversarialType {
  MALFORMED_INPUT = "malformed_input",
  AMBIGUOUS_INPUT = "ambiguous_input",
  CONTRADICTORY_INPUT = "contradictory_input",
  BOUNDARY_CONDITION = "boundary_condition",
  NULLABILITY_STRESS = "nullability_stress",
  ENUM_DRIFT = "enum_drift",
  SCHEMA_MISMATCH = "schema_mismatch",
  CROSS_MODULE_INCONSISTENCY = "cross_module_inconsistency",
}
