import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { PublishableCandidateStatus } from "../../enums/publishable-candidate-status.enum.js";
import { CompilationStatus } from "../../enums/compilation-status.enum.js";
import { TitleGenerationStatus } from "../../enums/title-generation-status.enum.js";
import {
  createMarketDraftPipelineId,
  createPublishableCandidateId,
} from "../../value-objects/publishing-ids.vo.js";
import { createDeterministicToken, type PublishingIssue } from "../../value-objects/publishing-shared.vo.js";
import { REQUIRED_RULEBOOK_SECTION_TYPES } from "../../rulebook/entities/rulebook-compilation.entity.js";
import {
  createPublishableCandidate,
  type PublishableCandidate,
} from "../entities/publishable-candidate.entity.js";
import type {
  PublishableCandidateBuilder,
  PublishableCandidateBuilderInput,
} from "../interfaces/publishable-candidate-builder.js";

const toPipelineId = (marketId: string) => createMarketDraftPipelineId(`mdp_${marketId.slice(4)}pl`);

export class DeterministicPublishableCandidateBuilder implements PublishableCandidateBuilder {
  build(input: PublishableCandidateBuilderInput): PublishableCandidate {
    const pipelineId = toPipelineId(input.pipeline.foundation_candidate_market.id);
    const blockingIssues: PublishingIssue[] = [];
    const warnings: PublishingIssue[] = [];

    if (input.title_set.canonical_title.trim().length === 0 || input.title_set.display_title.trim().length === 0) {
      blockingIssues.push({
        code: "MISSING_TITLES",
        path: "/title_set",
        message: "canonical_title and display_title are required",
      });
    }
    if (input.resolution_summary.one_line_resolution_summary.trim().length === 0) {
      blockingIssues.push({
        code: "MISSING_RESOLUTION_SUMMARY",
        path: "/resolution_summary",
        message: "resolution summary must be present",
      });
    }

    const sectionTypes = new Set(
      input.rulebook_compilation.included_sections.map((section) => section.section_type),
    );
    const missingRequiredSection = REQUIRED_RULEBOOK_SECTION_TYPES.find((type) => !sectionTypes.has(type));
    if (missingRequiredSection !== undefined) {
      blockingIssues.push({
        code: "MISSING_REQUIRED_RULEBOOK_SECTION",
        path: "/rulebook_compilation/included_sections",
        message: `missing required section type: ${missingRequiredSection}`,
      });
    }

    if (input.rulebook_compilation.compilation_status !== CompilationStatus.COMPILED) {
      warnings.push({
        code: "RULEBOOK_NOT_COMPILED",
        path: "/rulebook_compilation/compilation_status",
        message: "rulebook compilation status is not COMPILED",
      });
    }
    if (input.title_set.title_generation_status !== TitleGenerationStatus.GENERATED) {
      warnings.push({
        code: "TITLE_NOT_GENERATED",
        path: "/title_set/title_generation_status",
        message: "title generation status is not GENERATED",
      });
    }

    const score = Math.max(0, Math.min(100, 100 - blockingIssues.length * 40 - warnings.length * 10));
    const status =
      blockingIssues.length > 0
        ? PublishableCandidateStatus.INVALID
        : warnings.length > 0
          ? PublishableCandidateStatus.BLOCKED
          : PublishableCandidateStatus.STRUCTURALLY_READY;

    return createPublishableCandidate({
      id: createPublishableCandidateId(
        `pcnd_${createDeterministicToken(`${pipelineId}|${input.title_set.id}|${input.rulebook_compilation.id}`)}can`,
      ),
      version: createEntityVersion(1),
      market_draft_pipeline_id: pipelineId,
      title_set_id: input.title_set.id,
      resolution_summary_id: input.resolution_summary.id,
      rulebook_compilation_id: input.rulebook_compilation.id,
      candidate_status: status,
      structural_readiness_score: score,
      blocking_issues: blockingIssues,
      warnings,
      compatibility_metadata: {
        upstream: {
          market_design: true,
          source_intelligence: true,
          event_intelligence: true,
          foundation_layer: true,
        },
      },
    });
  }
}
