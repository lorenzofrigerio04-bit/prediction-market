import type { NormalizationContext } from "../../observations/interfaces/normalization-context.js";
import type { ObservationNormalizationResult } from "../../observations/interfaces/observation-normalization-result.js";
import type { SourceDefinition } from "../entities/source-definition.entity.js";
import type { FetchRawRequest } from "./fetch-raw-request.js";
import type { FetchRawResult } from "./fetch-raw-result.js";
import type { PayloadValidationResult } from "./payload-validation-result.js";

export interface SourceAdapter<TRawPayload extends Record<string, unknown>> {
  canHandle(sourceDefinition: SourceDefinition): boolean;
  fetchRaw(request: FetchRawRequest): Promise<FetchRawResult<TRawPayload>>;
  validatePayload(payload: TRawPayload): PayloadValidationResult;
  normalize(
    payload: TRawPayload,
    sourceDefinition: SourceDefinition,
    context: NormalizationContext,
  ): ObservationNormalizationResult;
}
