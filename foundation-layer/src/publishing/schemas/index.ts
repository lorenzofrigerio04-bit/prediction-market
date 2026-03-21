import { titleSetSchema } from "./title-set.schema.js";
import { resolutionSummarySchema } from "./resolution-summary.schema.js";
import { rulebookSectionSchema } from "./rulebook-section.schema.js";
import { rulebookCompilationSchema } from "./rulebook-compilation.schema.js";
import { timePolicyRenderSchema } from "./time-policy-render.schema.js";
import { sourcePolicyRenderSchema } from "./source-policy-render.schema.js";
import { edgeCaseRenderSchema } from "./edge-case-render.schema.js";
import { publishableCandidateSchema } from "./publishable-candidate.schema.js";

export const publishingSchemas = [
  titleSetSchema,
  resolutionSummarySchema,
  rulebookSectionSchema,
  rulebookCompilationSchema,
  timePolicyRenderSchema,
  sourcePolicyRenderSchema,
  edgeCaseRenderSchema,
  publishableCandidateSchema,
] as const;

export {
  titleSetSchema,
  resolutionSummarySchema,
  rulebookSectionSchema,
  rulebookCompilationSchema,
  timePolicyRenderSchema,
  sourcePolicyRenderSchema,
  edgeCaseRenderSchema,
  publishableCandidateSchema,
};
