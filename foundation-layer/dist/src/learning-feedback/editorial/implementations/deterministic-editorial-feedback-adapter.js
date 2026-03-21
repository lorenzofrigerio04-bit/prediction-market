import { createEditorialFeedback } from "../entities/editorial-feedback.entity.js";
export class DeterministicEditorialFeedbackAdapter {
    adapt(input) {
        return createEditorialFeedback(input);
    }
}
//# sourceMappingURL=deterministic-editorial-feedback-adapter.js.map