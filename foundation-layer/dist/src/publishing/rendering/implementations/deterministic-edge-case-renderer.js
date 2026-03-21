import { createEdgeCaseRender } from "../entities/edge-case-render.entity.js";
export class DeterministicEdgeCaseRenderer {
    render(input) {
        const edgeCaseItems = [];
        const invalidationItems = [];
        if (input.preliminary_scorecard.ambiguity_risk_score >= 0.5) {
            edgeCaseItems.push("Ambiguous wording detected upstream; requires strict source-backed interpretation.");
        }
        if (input.preliminary_scorecard.duplicate_risk_score >= 0.5) {
            edgeCaseItems.push("Potential duplicate market scenario; compare against active listings before publication.");
        }
        if (input.deadline_resolution.warnings.length > 0) {
            edgeCaseItems.push(...input.deadline_resolution.warnings);
        }
        invalidationItems.push("Invalidate if required primary source evidence is unavailable at resolution time.");
        invalidationItems.push("Invalidate if canonical question cannot be resolved under defined deadline policy.");
        return createEdgeCaseRender({
            edge_case_items: edgeCaseItems.length > 0 ? edgeCaseItems : ["No material edge cases detected."],
            invalidation_items: invalidationItems,
            notes_nullable: `Derived deterministically from scorecard and deadline warnings for ${input.foundation_candidate_market.id}.`,
        });
    }
}
//# sourceMappingURL=deterministic-edge-case-renderer.js.map