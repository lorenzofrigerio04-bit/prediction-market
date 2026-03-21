import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { IdentifierKind } from "../enums/identifier-kind.enum.js";

export type SourceBaseIdentifier = Readonly<{
  kind: IdentifierKind;
  value: string;
}>;

export const createSourceBaseIdentifier = (
  kind: IdentifierKind,
  value: string,
): SourceBaseIdentifier => {
  const normalizedValue = value.trim();
  if (normalizedValue.length === 0) {
    throw new ValidationError(
      "INVALID_SOURCE_BASE_IDENTIFIER",
      "SourceBaseIdentifier value must be non-empty",
      { value },
    );
  }

  return deepFreeze({
    kind,
    value: normalizedValue,
  });
};
