import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";

export type DiscoveryExecutionWindow = Readonly<{
  start: Timestamp;
  end: Timestamp;
}>;

export const createDiscoveryExecutionWindow = (
  input: DiscoveryExecutionWindow,
): DiscoveryExecutionWindow =>
  deepFreeze({
    start: input.start,
    end: input.end,
  });
