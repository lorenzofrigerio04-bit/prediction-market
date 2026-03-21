import { createTimePolicyRender } from "../entities/time-policy-render.entity.js";
export class DeterministicTimePolicyRenderer {
    render(input) {
        const policyNotes = [...new Set(input.warnings)];
        return createTimePolicyRender({
            timezone: input.timezone,
            deadline_text: `Event deadline: ${input.event_deadline} (${input.timezone})`,
            close_time_text: `Market closes at: ${input.market_close_time} (${input.timezone})`,
            cutoff_text_nullable: input.resolution_cutoff_nullable === null
                ? null
                : `Final resolution cutoff: ${input.resolution_cutoff_nullable} (${input.timezone})`,
            policy_notes: policyNotes,
            metadata: {
                deadline_basis_type: input.deadline_basis_type,
                deadline_basis_reference: input.deadline_basis_reference,
            },
        });
    }
}
//# sourceMappingURL=deterministic-time-policy-renderer.js.map