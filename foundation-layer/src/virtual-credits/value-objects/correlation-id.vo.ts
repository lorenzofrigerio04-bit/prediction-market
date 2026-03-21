import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type CorrelationId = Branded<string, "CorrelationId">;

export const createCorrelationId = (value: string): CorrelationId => {
  const normalized = createNonEmpty(value, "correlationId");
  if (normalized.length > 512) {
    throw new ValidationError("CORRELATION_ID_EMPTY", "CorrelationId exceeds max length", { length: normalized.length });
  }
  return normalized as CorrelationId;
};
