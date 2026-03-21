import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";

export type DiscoverySignalTimeWindow = Readonly<{
  start: Timestamp;
  end: Timestamp;
}>;

export const createDiscoverySignalTimeWindow = (
  input: DiscoverySignalTimeWindow,
): DiscoverySignalTimeWindow =>
  deepFreeze({
    start: input.start,
    end: input.end,
  });
