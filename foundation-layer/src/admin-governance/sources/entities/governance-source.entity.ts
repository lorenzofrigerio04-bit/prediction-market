import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { GovernanceSourceType } from "../../enums/governance-source-type.enum.js";
import type { GovernanceSourceId, Metadata, SourceKey, VersionTag } from "../../value-objects/index.js";

export type GovernanceSource = Readonly<{
  id: GovernanceSourceId;
  version: VersionTag;
  source_key: SourceKey;
  source_type: GovernanceSourceType;
  trust_weight: number;
  active: boolean;
  metadata: Metadata;
}>;

export const createGovernanceSource = (input: GovernanceSource): GovernanceSource => deepFreeze({ ...input });
