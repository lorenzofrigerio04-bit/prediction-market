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
import { createRaceMarketDefinitionId } from "../../src/frontier-markets/value-objects/frontier-market-ids.vo.js";
import {
  createDisplayLabel,
  createSemanticDefinition,
} from "../../src/frontier-markets/value-objects/frontier-text.vo.js";
import { createRaceTargetKey } from "../../src/frontier-markets/value-objects/race-target-key.vo.js";
import { createRaceTarget } from "../../src/frontier-markets/race/entities/race-target.entity.js";
import { createRaceMarketDefinition } from "../../src/frontier-markets/race/entities/race-market-definition.entity.js";
import { RaceValidationStatus } from "../../src/frontier-markets/enums/race-validation-status.enum.js";
import { WinningConditionType } from "../../src/frontier-markets/enums/winning-condition-type.enum.js";
import { validateRaceMarketDefinition } from "../../src/frontier-markets/validators/validate-race-market-definition.js";

const makeDeadlineResolution = () =>
  createDeadlineResolution({
    id: createDeadlineResolutionId("dlr_frontier01"),
    canonical_event_id: createCanonicalEventIntelligenceId("cevt_frontier001"),
    event_deadline: createTimestamp("2026-11-20T10:00:00.000Z"),
    market_close_time: createTimestamp("2026-11-20T09:00:00.000Z"),
    resolution_cutoff_nullable: null,
    timezone: "UTC",
    deadline_basis_type: DeadlineBasisType.EVENT_TIME,
    deadline_basis_reference: "canonical_event.time_window.end_at",
    confidence: 0.9,
    warnings: [],
  });

const makeSourceHierarchySelection = () =>
  createSourceHierarchySelection({
    id: createSourceHierarchySelectionId("shs_frontier001"),
    canonical_event_id: createCanonicalEventIntelligenceId("cevt_frontier001"),
    candidate_source_classes: [SourceClass.OFFICIAL, SourceClass.MEDIA],
    selected_source_priority: [
      { source_class: SourceClass.OFFICIAL, priority_rank: 1 },
      { source_class: SourceClass.MEDIA, priority_rank: 2 },
    ],
    source_selection_reason: "official sources first",
    source_confidence: 0.9,
  });

const makeRaceTarget = (key: string, active = true) =>
  createRaceTarget({
    target_key: createRaceTargetKey(key),
    display_label: createDisplayLabel(`Label ${key}`),
    semantic_definition: createSemanticDefinition(`Definition ${key}`),
    active,
    ordering_priority_nullable: 1,
  });

const makeValidRaceDefinition = () =>
  createRaceMarketDefinition({
    id: createRaceMarketDefinitionId("frc_frontier001"),
    version: createEntityVersion(1),
    parent_canonical_event_id_nullable: createCanonicalEventIntelligenceId("cevt_frontier001"),
    race_targets: [makeRaceTarget("alpha"), makeRaceTarget("beta")],
    winning_condition: {
      type: WinningConditionType.FIRST_TO_OCCUR,
      tie_break_policy: "lowest_ordering_priority",
    },
    deadline_resolution: makeDeadlineResolution(),
    source_hierarchy_selection: makeSourceHierarchySelection(),
    race_validation_status: RaceValidationStatus.VALID,
    metadata: {},
  });

describe("RaceMarketDefinition", () => {
  it("valid RaceMarketDefinition", () => {
    const report = validateRaceMarketDefinition(makeValidRaceDefinition());
    expect(report.isValid).toBe(true);
  });

  it("invalid RaceMarketDefinition with less than two active targets", () => {
    const invalid = {
      ...makeValidRaceDefinition(),
      race_targets: [makeRaceTarget("alpha", true), makeRaceTarget("beta", false)],
    };
    const report = validateRaceMarketDefinition(invalid);
    expect(report.isValid).toBe(false);
  });

  it("invalid RaceMarketDefinition with duplicate target keys", () => {
    const duplicate = createRaceTarget({
      target_key: createRaceTargetKey("alpha"),
      display_label: createDisplayLabel("Duplicate alpha"),
      semantic_definition: createSemanticDefinition("Duplicate key"),
      active: true,
      ordering_priority_nullable: 2,
    });
    const invalid = {
      ...makeValidRaceDefinition(),
      race_targets: [makeRaceTarget("alpha"), duplicate],
    };
    const report = validateRaceMarketDefinition(invalid);
    expect(report.isValid).toBe(false);
  });
});
