import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type SignalPayloadSummary = Branded<string, "SignalPayloadSummary">;

export const createSignalPayloadSummary = (value: string): SignalPayloadSummary => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_SIGNAL_PAYLOAD_SUMMARY", "signal_payload_summary must not be empty", { value });
  }
  return normalized as SignalPayloadSummary;
};
