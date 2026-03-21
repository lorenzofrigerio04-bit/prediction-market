import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { CompilationStatus } from "../../enums/compilation-status.enum.js";
import { RulebookSectionType } from "../../enums/rulebook-section-type.enum.js";
import {
  createMarketDraftPipelineId,
  createRulebookCompilationId,
  createRulebookSectionId,
} from "../../value-objects/publishing-ids.vo.js";
import { createDeterministicToken } from "../../value-objects/publishing-shared.vo.js";
import { type EdgeCaseRenderer } from "../../rendering/interfaces/edge-case-renderer.js";
import { type SourcePolicyRenderer } from "../../rendering/interfaces/source-policy-renderer.js";
import { type TimePolicyRenderer } from "../../rendering/interfaces/time-policy-renderer.js";
import {
  createRulebookCompilation,
  type RulebookCompilation,
} from "../entities/rulebook-compilation.entity.js";
import { createRulebookSection, type RulebookSection } from "../entities/rulebook-section.entity.js";
import type { RulebookCompiler, RulebookCompilerInput } from "../interfaces/rulebook-compiler.js";
import {
  toFoundationRulebookDraft,
} from "../adapters/foundation-rulebook-draft.adapter.js";
import type { RulebookDraftContract } from "../contracts/rulebook-draft.contract.js";

const toPipelineId = (input: MarketDraftPipeline) =>
  createMarketDraftPipelineId(`mdp_${input.foundation_candidate_market.id.slice(4)}pl`);

const createSection = (
  marketDraftPipelineId: string,
  sectionType: RulebookSectionType,
  title: string,
  body: string,
  orderingIndex: number,
): RulebookSection =>
  createRulebookSection({
    id: createRulebookSectionId(
      `rbsec_${createDeterministicToken(`${marketDraftPipelineId}|${sectionType}`)}sec`,
    ),
    section_type: sectionType,
    title,
    body,
    ordering_index: orderingIndex,
    required: true,
  });

const buildResolutionCriteriaBody = (draft: RulebookDraftContract): string =>
  [
    `YES criteria: ${draft.resolutionCriteriaYes ?? "N/A"}`,
    `NO criteria: ${draft.resolutionCriteriaNo ?? "N/A"}`,
  ].join("\n");

export class DeterministicRulebookCompiler implements RulebookCompiler {
  constructor(
    private readonly timePolicyRenderer: TimePolicyRenderer,
    private readonly sourcePolicyRenderer: SourcePolicyRenderer,
    private readonly edgeCaseRenderer: EdgeCaseRenderer,
  ) {}

  compile(input: RulebookCompilerInput): RulebookCompilation {
    const pipeline = input.pipeline;
    const pipelineId = toPipelineId(pipeline);
    const draft = input.foundation_rulebook_draft_nullable ?? toFoundationRulebookDraft(pipeline);
    const timeRender = this.timePolicyRenderer.render(pipeline.deadline_resolution);
    const sourceRender = this.sourcePolicyRenderer.render(pipeline.source_hierarchy_selection);
    const edgeRender = this.edgeCaseRenderer.render(pipeline);

    const canonicalQuestion = createSection(
      pipelineId,
      RulebookSectionType.CANONICAL_QUESTION,
      "Canonical Question",
      draft.title,
      0,
    );
    const contractDefinition = createSection(
      pipelineId,
      RulebookSectionType.CONTRACT_DEFINITION,
      "Contract Definition",
      `Contract type: ${pipeline.contract_selection.selected_contract_type}.`,
      1,
    );
    const resolutionCriteria = createSection(
      pipelineId,
      RulebookSectionType.RESOLUTION_CRITERIA,
      "Resolution Criteria",
      buildResolutionCriteriaBody(draft),
      2,
    );
    const sourcePolicy = createSection(
      pipelineId,
      RulebookSectionType.SOURCE_POLICY,
      "Source Policy",
      [sourceRender.source_policy_text, sourceRender.fallback_policy_text_nullable]
        .filter((item): item is string => item !== null)
        .join("\n"),
      3,
    );
    const timePolicy = createSection(
      pipelineId,
      RulebookSectionType.TIME_POLICY,
      "Time Policy",
      [timeRender.deadline_text, timeRender.close_time_text, timeRender.cutoff_text_nullable]
        .filter((item): item is string => item !== null)
        .join("\n"),
      4,
    );
    const edgeCases = createSection(
      pipelineId,
      RulebookSectionType.EDGE_CASES,
      "Edge Cases",
      edgeRender.edge_case_items.join("\n"),
      5,
    );
    const invalidation = createSection(
      pipelineId,
      RulebookSectionType.INVALIDATION,
      "Invalidation Conditions",
      edgeRender.invalidation_items.join("\n"),
      6,
    );
    const examples = createSection(
      pipelineId,
      RulebookSectionType.EXAMPLES,
      "Examples",
      "Example YES: criteria satisfied by top-priority source before deadline.\nExample NO: criteria not satisfied before deadline.",
      7,
    );

    const includedSections = [
      canonicalQuestion,
      contractDefinition,
      resolutionCriteria,
      sourcePolicy,
      timePolicy,
      edgeCases,
      invalidation,
      examples,
    ];

    return createRulebookCompilation({
      id: createRulebookCompilationId(
        `rbcmp_${createDeterministicToken(`${pipelineId}|compiled`)}cmp`,
      ),
      version: createEntityVersion(1),
      market_draft_pipeline_id: pipelineId,
      canonical_question: canonicalQuestion,
      contract_definition: contractDefinition,
      resolution_criteria: resolutionCriteria,
      source_policy: sourcePolicy,
      time_policy: timePolicy,
      edge_case_section: edgeCases,
      invalidation_section: invalidation,
      examples_section: examples,
      included_sections: includedSections,
      compilation_status: CompilationStatus.COMPILED,
      compilation_metadata: {
        compiler: "DeterministicRulebookCompiler",
        used_foundation_draft: input.foundation_rulebook_draft_nullable != null,
      },
    });
  }
}
