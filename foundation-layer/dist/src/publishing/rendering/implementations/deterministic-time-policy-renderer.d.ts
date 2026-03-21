import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import { type TimePolicyRender } from "../entities/time-policy-render.entity.js";
import type { TimePolicyRenderer } from "../interfaces/time-policy-renderer.js";
export declare class DeterministicTimePolicyRenderer implements TimePolicyRenderer {
    render(input: DeadlineResolution): TimePolicyRender;
}
//# sourceMappingURL=deterministic-time-policy-renderer.d.ts.map