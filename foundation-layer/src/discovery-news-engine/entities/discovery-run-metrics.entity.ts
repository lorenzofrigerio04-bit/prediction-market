import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type DiscoveryRunMetrics = Readonly<{
  itemsFetched: number;
  itemsNormalized: number;
  signalsEmitted: number;
  duplicatesSkipped: number;
  errorsCount: number;
}>;

export const createDiscoveryRunMetrics = (
  input: DiscoveryRunMetrics,
): DiscoveryRunMetrics => deepFreeze({ ...input });
