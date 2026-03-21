import type { DeterministicMetadata } from "../../value-objects/publishing-shared.vo.js";
export type TimePolicyRender = Readonly<{
    timezone: string;
    deadline_text: string;
    close_time_text: string;
    cutoff_text_nullable: string | null;
    policy_notes: readonly string[];
    metadata: DeterministicMetadata;
}>;
export declare const createTimePolicyRender: (input: TimePolicyRender) => TimePolicyRender;
//# sourceMappingURL=time-policy-render.entity.d.ts.map