import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type TraceReference = Readonly<{
  trace_id: string;
  span_id_nullable: string | null;
  parent_trace_id_nullable: string | null;
}>;

export const createTraceReference = (input: TraceReference): TraceReference => {
  if (input.trace_id.trim().length === 0) {
    throw new ValidationError("INVALID_TRACE_REFERENCE", "trace_id must not be empty");
  }
  return deepFreeze(input);
};

export const createTraceReferenceCollection = (
  input: readonly TraceReference[],
): readonly TraceReference[] => deepFreeze(input.map((item) => createTraceReference(item)));
