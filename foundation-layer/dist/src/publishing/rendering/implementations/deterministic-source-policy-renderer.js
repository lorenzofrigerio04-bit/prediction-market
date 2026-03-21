import { createSourcePolicyRender } from "../entities/source-policy-render.entity.js";
export class DeterministicSourcePolicyRenderer {
    render(input) {
        const ordered = [...input.selected_source_priority]
            .sort((left, right) => left.priority_rank - right.priority_rank)
            .map((item) => `${item.priority_rank}. ${item.source_class}`);
        const fallback = ordered.length > 1 ? `Fallback order: ${ordered.slice(1).join(" > ")}` : null;
        return createSourcePolicyRender({
            selected_source_priority: ordered,
            source_policy_text: `Primary resolution source class: ${ordered[0] ?? "N/A"}.`,
            fallback_policy_text_nullable: fallback,
        });
    }
}
//# sourceMappingURL=deterministic-source-policy-renderer.js.map