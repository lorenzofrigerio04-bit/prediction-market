import type { EditorialFeedbackSignal } from "../entities/editorial-feedback-signal.entity.js";

export interface EditorialFeedbackSignalBuilder {
  build(input: EditorialFeedbackSignal): EditorialFeedbackSignal;
}
