import { deepFreeze } from "../../common/utils/deep-freeze.js";

/**
 * Minimal structured observed metrics for discovery items.
 * Adapters set only the fields they have; no overbuilt analytics model.
 */
export type DiscoveryObservedMetrics = Readonly<{
  pageviewsNullable?: number;
  timeframeNullable?: string;
  regionNullable?: string;
  channelIdNullable?: string;
}>;

export const createDiscoveryObservedMetrics = (
  input: DiscoveryObservedMetrics,
): DiscoveryObservedMetrics => deepFreeze({ ...input });
