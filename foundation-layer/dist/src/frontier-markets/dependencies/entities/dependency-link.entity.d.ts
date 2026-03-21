import { DependencyStrength } from "../../enums/dependency-strength.enum.js";
import { DependencyType } from "../../enums/dependency-type.enum.js";
import type { DependencyLinkId } from "../../value-objects/frontier-market-ids.vo.js";
export type DependencyRef = Readonly<{
    ref_type: "event" | "market" | "contract";
    ref_id: string;
}>;
export type DependencyLink = Readonly<{
    id: DependencyLinkId;
    source_ref: DependencyRef;
    target_ref: DependencyRef;
    dependency_type: DependencyType;
    dependency_strength: DependencyStrength;
    blocking: boolean;
}>;
export declare const createDependencyLink: (input: DependencyLink) => DependencyLink;
//# sourceMappingURL=dependency-link.entity.d.ts.map