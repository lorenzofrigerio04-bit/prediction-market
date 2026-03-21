import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type OverrideScope = Readonly<{
  affected_fields: readonly string[];
  allow_readiness_gate_bypass: boolean;
}>;

export const createOverrideScope = (input: OverrideScope): OverrideScope => {
  if (
    input.affected_fields.length === 0 ||
    input.affected_fields.some((field) => field.trim().length === 0)
  ) {
    throw new ValidationError(
      "INVALID_OVERRIDE_SCOPE",
      "override scope must include at least one non-empty affected field",
    );
  }
  return deepFreeze({
    ...input,
    affected_fields: deepFreeze([...input.affected_fields]),
  });
};
