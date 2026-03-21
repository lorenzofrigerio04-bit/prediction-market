import { deepFreeze } from "../../../common/utils/deep-freeze.js";

export type PermissionEvaluationBasis = Readonly<{
  source_module: string;
  evaluated_roles: readonly string[];
  matched_rules: readonly string[];
  deny_reasons: readonly string[];
}>;

export const createPermissionEvaluationBasis = (
  input: PermissionEvaluationBasis,
): PermissionEvaluationBasis => deepFreeze({ ...input });
