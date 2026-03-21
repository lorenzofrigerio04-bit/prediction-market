import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { ConfidenceScore } from "../../../value-objects/confidence-score.vo.js";
import type { MarketDraftPipelineId, ResolutionSummaryId } from "../../value-objects/publishing-ids.vo.js";
import { createSummaryConfidence, createTextBlock } from "../../value-objects/publishing-shared.vo.js";

export type SummaryBasis = Readonly<{
  resolution_rule_ref: string;
  source_hierarchy_ref: string;
  deadline_ref: string;
  basis_points: readonly string[];
}>;

export type ResolutionSummary = Readonly<{
  id: ResolutionSummaryId;
  version: EntityVersion;
  market_draft_pipeline_id: MarketDraftPipelineId;
  one_line_resolution_summary: string;
  summary_basis: SummaryBasis;
  summary_confidence: ConfidenceScore;
}>;

const createSummaryBasis = (value: SummaryBasis): SummaryBasis => {
  const basisPoints = value.basis_points.map((item, index) =>
    createTextBlock(item, `summary_basis.basis_points[${index}]`),
  );
  if (new Set(basisPoints.map((item) => item.toLowerCase())).size !== basisPoints.length) {
    throw new ValidationError(
      "DUPLICATE_SUMMARY_BASIS",
      "summary_basis.basis_points must contain unique values",
    );
  }
  return deepFreeze({
    resolution_rule_ref: createTextBlock(value.resolution_rule_ref, "summary_basis.resolution_rule_ref"),
    source_hierarchy_ref: createTextBlock(
      value.source_hierarchy_ref,
      "summary_basis.source_hierarchy_ref",
    ),
    deadline_ref: createTextBlock(value.deadline_ref, "summary_basis.deadline_ref"),
    basis_points: [...basisPoints],
  });
};

export const createResolutionSummary = (input: ResolutionSummary): ResolutionSummary =>
  deepFreeze({
    ...input,
    one_line_resolution_summary: createTextBlock(
      input.one_line_resolution_summary,
      "one_line_resolution_summary",
    ),
    summary_basis: createSummaryBasis(input.summary_basis),
    summary_confidence: createSummaryConfidence(input.summary_confidence),
  });
