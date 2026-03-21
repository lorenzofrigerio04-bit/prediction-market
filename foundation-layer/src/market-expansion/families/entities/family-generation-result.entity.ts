import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { GenerationStatus } from "../../enums/generation-status.enum.js";
import type {
  FamilyGenerationResultId,
  MarketFamilyId,
} from "../../value-objects/market-expansion-ids.vo.js";
import {
  createConfidenceScore01,
  createDistinctMarketRefs,
  createExpansionNote,
  createMarketRef,
  type ConfidenceScore01,
  type ExpansionNote,
  type MarketRef,
} from "../../value-objects/market-expansion-shared.vo.js";

export type FamilyGenerationResult = Readonly<{
  id: FamilyGenerationResultId;
  version: EntityVersion;
  market_family_id: MarketFamilyId;
  generated_market_refs: readonly MarketRef[];
  flagship_ref: MarketRef;
  generation_status: GenerationStatus;
  generation_confidence: ConfidenceScore01;
  output_notes_nullable: ExpansionNote | null;
}>;

export const createFamilyGenerationResult = (input: FamilyGenerationResult): FamilyGenerationResult =>
  deepFreeze({
    ...input,
    generated_market_refs: createDistinctMarketRefs(input.generated_market_refs, "generated_market_refs"),
    flagship_ref: createMarketRef(input.flagship_ref),
    generation_confidence: createConfidenceScore01(input.generation_confidence, "generation_confidence"),
    output_notes_nullable: input.output_notes_nullable === null ? null : createExpansionNote(input.output_notes_nullable),
  });
