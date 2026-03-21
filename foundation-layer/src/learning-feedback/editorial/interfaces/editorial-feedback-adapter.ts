import type { EditorialFeedback } from "../entities/editorial-feedback.entity.js";

export interface EditorialFeedbackAdapter<TInput = EditorialFeedback> {
  adapt(input: TInput): EditorialFeedback;
}
