import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { CompilationStatus } from "../../enums/compilation-status.enum.js";
import { RulebookSectionType } from "../../enums/rulebook-section-type.enum.js";
import type {
  MarketDraftPipelineId,
  RulebookCompilationId,
} from "../../value-objects/publishing-ids.vo.js";
import {
  type DeterministicMetadata,
  createDeterministicMetadata,
} from "../../value-objects/publishing-shared.vo.js";
import { createRulebookSection, type RulebookSection } from "./rulebook-section.entity.js";

export const REQUIRED_RULEBOOK_SECTION_TYPES: readonly RulebookSectionType[] = [
  RulebookSectionType.CANONICAL_QUESTION,
  RulebookSectionType.CONTRACT_DEFINITION,
  RulebookSectionType.RESOLUTION_CRITERIA,
  RulebookSectionType.SOURCE_POLICY,
  RulebookSectionType.TIME_POLICY,
  RulebookSectionType.EDGE_CASES,
  RulebookSectionType.INVALIDATION,
  RulebookSectionType.EXAMPLES,
];

export type RulebookCompilation = Readonly<{
  id: RulebookCompilationId;
  version: EntityVersion;
  market_draft_pipeline_id: MarketDraftPipelineId;
  canonical_question: RulebookSection;
  contract_definition: RulebookSection;
  resolution_criteria: RulebookSection;
  source_policy: RulebookSection;
  time_policy: RulebookSection;
  edge_case_section: RulebookSection;
  invalidation_section: RulebookSection;
  examples_section: RulebookSection;
  included_sections: readonly RulebookSection[];
  compilation_status: CompilationStatus;
  compilation_metadata: DeterministicMetadata;
}>;

const assertSectionType = (
  field: string,
  section: RulebookSection,
  expected: RulebookSectionType,
): RulebookSection => {
  const normalized = createRulebookSection(section);
  if (normalized.section_type !== expected) {
    throw new ValidationError("RULEBOOK_SECTION_TYPE_MISMATCH", `${field} must have type ${expected}`, {
      field,
      expected,
      actual: normalized.section_type,
    });
  }
  return normalized;
};

export const createRulebookCompilation = (input: RulebookCompilation): RulebookCompilation => {
  if (!Object.values(CompilationStatus).includes(input.compilation_status)) {
    throw new ValidationError("INVALID_RULEBOOK_COMPILATION", "compilation_status is invalid");
  }

  const canonicalQuestion = assertSectionType(
    "canonical_question",
    input.canonical_question,
    RulebookSectionType.CANONICAL_QUESTION,
  );
  const contractDefinition = assertSectionType(
    "contract_definition",
    input.contract_definition,
    RulebookSectionType.CONTRACT_DEFINITION,
  );
  const resolutionCriteria = assertSectionType(
    "resolution_criteria",
    input.resolution_criteria,
    RulebookSectionType.RESOLUTION_CRITERIA,
  );
  const sourcePolicy = assertSectionType(
    "source_policy",
    input.source_policy,
    RulebookSectionType.SOURCE_POLICY,
  );
  const timePolicy = assertSectionType("time_policy", input.time_policy, RulebookSectionType.TIME_POLICY);
  const edgeCases = assertSectionType(
    "edge_case_section",
    input.edge_case_section,
    RulebookSectionType.EDGE_CASES,
  );
  const invalidation = assertSectionType(
    "invalidation_section",
    input.invalidation_section,
    RulebookSectionType.INVALIDATION,
  );
  const examples = assertSectionType("examples_section", input.examples_section, RulebookSectionType.EXAMPLES);

  const includedSections = input.included_sections.map(createRulebookSection);
  const includedTypes = new Set(includedSections.map((section) => section.section_type));
  const missingTypes = REQUIRED_RULEBOOK_SECTION_TYPES.filter((type) => !includedTypes.has(type));
  if (missingTypes.length > 0) {
    throw new ValidationError(
      "MISSING_REQUIRED_RULEBOOK_SECTIONS",
      "included_sections is missing required section types",
      { missing_types: missingTypes },
    );
  }
  if (new Set(includedSections.map((section) => section.id)).size !== includedSections.length) {
    throw new ValidationError(
      "DUPLICATE_RULEBOOK_SECTION_IDS",
      "included_sections must not contain duplicate section ids",
    );
  }
  return deepFreeze({
    ...input,
    canonical_question: canonicalQuestion,
    contract_definition: contractDefinition,
    resolution_criteria: resolutionCriteria,
    source_policy: sourcePolicy,
    time_policy: timePolicy,
    edge_case_section: edgeCases,
    invalidation_section: invalidation,
    examples_section: examples,
    included_sections: [...includedSections],
    compilation_metadata: createDeterministicMetadata(
      input.compilation_metadata as Record<string, unknown>,
      "compilation_metadata",
    ),
  });
};
