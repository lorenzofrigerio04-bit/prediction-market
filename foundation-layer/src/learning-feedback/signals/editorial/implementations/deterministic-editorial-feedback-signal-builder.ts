import {
  createEditorialFeedbackSignal,
  type EditorialFeedbackSignal,
} from "../entities/editorial-feedback-signal.entity.js";
import type { EditorialFeedbackSignalBuilder } from "../interfaces/editorial-feedback-signal-builder.js";

export class DeterministicEditorialFeedbackSignalBuilder
  implements EditorialFeedbackSignalBuilder
{
  build(input: EditorialFeedbackSignal): EditorialFeedbackSignal {
    return createEditorialFeedbackSignal(input);
  }
}
