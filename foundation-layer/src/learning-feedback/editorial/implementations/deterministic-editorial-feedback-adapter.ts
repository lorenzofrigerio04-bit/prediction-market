import type { EditorialFeedbackAdapter } from "../interfaces/editorial-feedback-adapter.js";
import { createEditorialFeedback, type EditorialFeedback } from "../entities/editorial-feedback.entity.js";

export class DeterministicEditorialFeedbackAdapter
  implements EditorialFeedbackAdapter<EditorialFeedback>
{
  adapt(input: EditorialFeedback): EditorialFeedback {
    return createEditorialFeedback(input);
  }
}
