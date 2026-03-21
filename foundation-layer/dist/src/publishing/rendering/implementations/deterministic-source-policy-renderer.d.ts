import type { SourceHierarchySelection } from "../../../market-design/source-hierarchy/entities/source-hierarchy-selection.entity.js";
import { type SourcePolicyRender } from "../entities/source-policy-render.entity.js";
import type { SourcePolicyRenderer } from "../interfaces/source-policy-renderer.js";
export declare class DeterministicSourcePolicyRenderer implements SourcePolicyRenderer {
    render(input: SourceHierarchySelection): SourcePolicyRender;
}
//# sourceMappingURL=deterministic-source-policy-renderer.d.ts.map