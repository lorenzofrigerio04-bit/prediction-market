import type { EditorialFeedbackAdapter } from "../interfaces/editorial-feedback-adapter.js";
import { type EditorialFeedback } from "../entities/editorial-feedback.entity.js";
export declare class DeterministicEditorialFeedbackAdapter implements EditorialFeedbackAdapter<EditorialFeedback> {
    adapt(input: EditorialFeedback): EditorialFeedback;
}
//# sourceMappingURL=deterministic-editorial-feedback-adapter.d.ts.map