import type { SourceHierarchySelection } from "../../../market-design/source-hierarchy/entities/source-hierarchy-selection.entity.js";
import type { SourcePolicyRender } from "../entities/source-policy-render.entity.js";
export interface SourcePolicyRenderer {
    render(input: SourceHierarchySelection): SourcePolicyRender;
}
//# sourceMappingURL=source-policy-renderer.d.ts.map