import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { SourceReferenceKind } from "../enums/source-reference-kind.enum.js";

export type SourceReference = Readonly<{
  kind: SourceReferenceKind;
  reference: string;
  locator: string | null;
}>;

export const createSourceReference = (input: SourceReference): SourceReference => {
  const reference = input.reference.trim();
  if (reference.length === 0) {
    throw new ValidationError(
      "INVALID_SOURCE_REFERENCE",
      "SourceReference reference must be non-empty",
    );
  }
  const locator = input.locator === null ? null : input.locator.trim();
  if (locator !== null && locator.length === 0) {
    throw new ValidationError("INVALID_SOURCE_REFERENCE", "SourceReference locator cannot be empty");
  }
  return deepFreeze({
    kind: input.kind,
    reference,
    locator,
  });
};
