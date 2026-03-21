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
export declare const createGovernanceSource: (input: GovernanceSource) => GovernanceSource;
//# sourceMappingURL=governance-source.entity.d.ts.map