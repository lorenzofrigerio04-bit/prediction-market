import type { EditorialFeedback } from "../../editorial/entities/editorial-feedback.entity.js";
import type { ReliabilityFeedback } from "../../reliability/entities/reliability-feedback.entity.js";
import { SignalType } from "../../enums/signal-type.enum.js";

export type FeedbackSignal =
  | Readonly<{ signal_type: SignalType.EDITORIAL; payload: EditorialFeedback }>
  | Readonly<{ signal_type: SignalType.RELIABILITY; payload: ReliabilityFeedback }>;

export const createFeedbackSignal = (input: FeedbackSignal): FeedbackSignal => input;
