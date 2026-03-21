import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type EventLeadReasonImpact = "positive" | "negative" | "neutral";

export type EventLeadReason = Readonly<{
  code: string;
  label: string;
  impact: EventLeadReasonImpact;
}>;

export const createEventLeadReason = (
  input: EventLeadReason,
): EventLeadReason => deepFreeze({ ...input });
