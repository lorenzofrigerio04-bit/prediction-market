import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { DiscoverySourceId } from "./discovery-source-id.vo.js";
import type { DiscoverySourceKey } from "./discovery-source-key.vo.js";

export type NormalizedSourceReference = Readonly<{
  sourceId: DiscoverySourceId;
  locator: string;
  labelNullable: string | null;
  sourceKeyNullable: DiscoverySourceKey | null;
}>;

export const createNormalizedSourceReference = (
  input: NormalizedSourceReference,
): NormalizedSourceReference =>
  deepFreeze({
    sourceId: input.sourceId,
    locator: input.locator,
    labelNullable: input.labelNullable ?? null,
    sourceKeyNullable: input.sourceKeyNullable ?? null,
  });
