import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type DiscoveryValidationFailure = Readonly<{
  code: string;
  path: string;
  message: string;
  contextNullable: Record<string, unknown> | null;
}>;

export const createDiscoveryValidationFailure = (
  input: DiscoveryValidationFailure,
): DiscoveryValidationFailure =>
  deepFreeze({
    ...input,
    contextNullable: input.contextNullable ?? null,
  });
