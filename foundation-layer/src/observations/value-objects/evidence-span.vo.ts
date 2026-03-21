import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { EvidenceSpanKind } from "../enums/evidence-span-kind.enum.js";

export type EvidenceSpan = Readonly<{
  spanId: string;
  kind: EvidenceSpanKind;
  locator: string;
  startOffset: number | null;
  endOffset: number | null;
  extractedText: string | null;
  mappedField: string | null;
}>;

export const createEvidenceSpan = (input: EvidenceSpan): EvidenceSpan => {
  const spanId = input.spanId.trim();
  const locator = input.locator.trim();
  if (spanId.length === 0 || locator.length === 0) {
    throw new ValidationError("INVALID_EVIDENCE_SPAN", "spanId and locator must be non-empty");
  }
  if (
    input.startOffset !== null &&
    input.endOffset !== null &&
    (input.startOffset < 0 || input.endOffset < input.startOffset)
  ) {
    throw new ValidationError("INVALID_EVIDENCE_SPAN", "offsets must satisfy 0 <= startOffset <= endOffset", {
      startOffset: input.startOffset,
      endOffset: input.endOffset,
    });
  }
  return deepFreeze({
    spanId,
    kind: input.kind,
    locator,
    startOffset: input.startOffset,
    endOffset: input.endOffset,
    extractedText: input.extractedText,
    mappedField: input.mappedField,
  });
};
