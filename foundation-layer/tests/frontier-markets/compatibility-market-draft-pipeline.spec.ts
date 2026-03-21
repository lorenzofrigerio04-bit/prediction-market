import { describe, expect, it } from "vitest";
import { createEntityVersion } from "../../src/value-objects/entity-version.vo.js";
import { createCanonicalEventIntelligenceId } from "../../src/event-intelligence/value-objects/event-intelligence-ids.vo.js";
import { createDeadlineResolution } from "../../src/market-design/deadlines/entities/deadline-resolution.entity.js";
import { DeadlineBasisType } from "../../src/market-design/enums/deadline-basis-type.enum.js";
import { createSourceHierarchySelection } from "../../src/market-design/source-hierarchy/entities/source-hierarchy-selection.entity.js";
import {
  createDeadlineResolutionId,
  createSourceHierarchySelectionId,
} from "../../src/market-design/value-objects/market-design-ids.vo.js";
import { SourceClass } from "../../src/sources/enums/source-class.enum.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
import { createRaceTargetKey } from "../../src/frontier-markets/value-objects/race-target-key.vo.js";
import { createRaceMarketDefinitionId } from "../../src/frontier-markets/value-objects/frontier-market-ids.vo.js";
import {
  createDisplayLabel,
  createSemanticDefinition,
} from "../../src/frontier-markets/value-objects/frontier-text.vo.js";
import { createRaceTarget } from "../../src/frontier-markets/race/entities/race-target.entity.js";
import { createRaceMarketDefinition } from "../../src/frontier-markets/race/entities/race-market-definition.entity.js";
import { RaceValidationStatus } from "../../src/frontier-markets/enums/race-validation-status.enum.js";
import { WinningConditionType } from "../../src/frontier-markets/enums/winning-condition-type.enum.js";
import { MarketDraftPipelineCompatibilityAdapter } from "../../src/frontier-markets/compatibility/implementations/market-draft-pipeline-compatibility.adapter.js";
import { validateFrontierMarketCompatibility } from "../../src/frontier-markets/validators/validate-frontier-market-compatibility.js";

const makeRaceContract = () =>
  createRaceMarketDefinition({
    id: createRaceMarketDefinitionId("frc_frontier002"),
    version: createEntityVersion(1),
    parent_canonical_event_id_nullable: createCanonicalEventIntelligenceId("cevt_frontier005"),
    race_targets: [
      createRaceTarget({
        target_key: createRaceTargetKey("alpha"),
        display_label: createDisplayLabel("Alpha"),
        semantic_definition: createSemanticDefinition("Alpha wins first"),
        active: true,
        ordering_priority_nullable: 1,
      }),
      createRaceTarget({
        target_key: createRaceTargetKey("beta"),
        display_label: createDisplayLabel("Beta"),
        semantic_definition: createSemanticDefinition("Beta wins first"),
        active: true,
        ordering_priority_nullable: 2,
      }),
    ],
    winning_condition: {
      type: WinningConditionType.FIRST_TO_OCCUR,
      tie_break_policy: "lowest_ordering_priority",
    },
    deadline_resolution: createDeadlineResolution({
      id: createDeadlineResolutionId("dlr_frontier04"),
      canonical_event_id: createCanonicalEventIntelligenceId("cevt_frontier005"),
      event_deadline: createTimestamp("2026-12-20T10:00:00.000Z"),
      market_close_time: createTimestamp("2026-12-20T09:00:00.000Z"),
      resolution_cutoff_nullable: null,
      timezone: "UTC",
      deadline_basis_type: DeadlineBasisType.EVENT_TIME,
      deadline_basis_reference: "canonical_event.time_window.end_at",
      confidence: 0.9,
      warnings: [],
    }),
    source_hierarchy_selection: createSourceHierarchySelection({
      id: createSourceHierarchySelectionId("shs_frontier005"),
      canonical_event_id: createCanonicalEventIntelligenceId("cevt_frontier005"),
      candidate_source_classes: [SourceClass.OFFICIAL, SourceClass.MEDIA],
      selected_source_priority: [
        { source_class: SourceClass.OFFICIAL, priority_rank: 1 },
        { source_class: SourceClass.MEDIA, priority_rank: 2 },
      ],
      source_selection_reason: "official-first",
      source_confidence: 0.9,
    }),
    race_validation_status: RaceValidationStatus.VALID,
    metadata: {},
  });

describe("MarketDraftPipelineCompatibilityAdapter", () => {
  it("compatibility test toward MarketDraftPipeline", () => {
    const adapter = new MarketDraftPipelineCompatibilityAdapter();
    const result = adapter.adapt(makeRaceContract());
    const report = validateFrontierMarketCompatibility(result);
    expect(report.isValid).toBe(true);
    expect(result.target).toBe("market_draft_pipeline");
  });

  it("fails compatibility validation when artifact readiness drifts from status", () => {
    const adapter = new MarketDraftPipelineCompatibilityAdapter();
    const result = adapter.adapt(makeRaceContract());
    const drifted = {
      ...result,
      mapped_artifact: {
        ...result.mapped_artifact,
        readiness: "incompatible",
      },
    };
    const report = validateFrontierMarketCompatibility(drifted);
    expect(report.isValid).toBe(false);
  });
});
