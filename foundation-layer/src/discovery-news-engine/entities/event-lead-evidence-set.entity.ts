import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import type { DiscoverySignalId } from "../value-objects/discovery-signal-id.vo.js";
import type { NormalizedExternalItemId } from "../value-objects/discovery-signal-evidence-ref.vo.js";

export type EventLeadEvidenceSet = Readonly<{
  clusterId: DiscoveryStoryClusterId;
  memberItemIds: readonly NormalizedExternalItemId[];
  memberSignalIds?: readonly DiscoverySignalId[];
  representativeHeadlineNullable: string | null;
}>;

export const createEventLeadEvidenceSet = (
  input: EventLeadEvidenceSet,
): EventLeadEvidenceSet => {
  const { memberSignalIds, ...rest } = input;
  return deepFreeze({
    ...rest,
    memberItemIds: [...input.memberItemIds],
    ...(memberSignalIds != null && memberSignalIds.length > 0
      ? { memberSignalIds: [...memberSignalIds] }
      : {}),
  });
};
