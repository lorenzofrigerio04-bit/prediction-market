import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import type { DiscoverySignalId } from "../value-objects/discovery-signal-id.vo.js";
import type { NormalizedExternalItemId } from "../value-objects/discovery-signal-evidence-ref.vo.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";

export type DiscoveryStoryClusterTimeSpan = Readonly<{
  earliest: Timestamp;
  latest: Timestamp;
}>;

export type DiscoveryStoryClusterTopicGeoSummary = Readonly<{
  topic?: DiscoveryTopicScope;
  geo?: DiscoveryGeoScope;
}>;

export type DiscoveryStoryClusterSummaryMemberIds = Readonly<{
  itemIds: readonly NormalizedExternalItemId[];
  signalIds?: readonly DiscoverySignalId[];
}>;

export type DiscoveryStoryClusterSummary = Readonly<{
  clusterId: DiscoveryStoryClusterId;
  memberIds: DiscoveryStoryClusterSummaryMemberIds;
  representativeHeadlineOrItemId: string;
  sourceDiversityCount: number;
  timeSpanNullable: DiscoveryStoryClusterTimeSpan | null;
  topicGeoSummaryNullable: DiscoveryStoryClusterTopicGeoSummary | null;
}>;

export const createDiscoveryStoryClusterSummary = (
  input: DiscoveryStoryClusterSummary,
): DiscoveryStoryClusterSummary =>
  deepFreeze({
    ...input,
    memberIds: {
      itemIds: [...input.memberIds.itemIds],
      ...(input.memberIds.signalIds != null && input.memberIds.signalIds.length > 0
        ? { signalIds: [...input.memberIds.signalIds] as readonly DiscoverySignalId[] }
        : {}),
    },
  });
