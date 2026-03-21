import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type DiscoveryFetchFailure = Readonly<{
  code: string;
  message: string;
  retryable: boolean;
  detailsNullable: Record<string, unknown> | null;
}>;

export const createDiscoveryFetchFailure = (
  input: DiscoveryFetchFailure,
): DiscoveryFetchFailure =>
  deepFreeze({
    ...input,
    detailsNullable: input.detailsNullable ?? null,
  });
