import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import type { TimePolicyRender } from "../entities/time-policy-render.entity.js";

export interface TimePolicyRenderer {
  render(input: DeadlineResolution): TimePolicyRender;
}
