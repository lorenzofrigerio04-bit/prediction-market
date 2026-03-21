import { describe, expect, it } from "vitest";
import { createEntityVersion } from "../../src/value-objects/entity-version.vo.js";
import {
  createCanonicalEventIntelligenceId,
  createEventGraphNodeId,
} from "../../src/event-intelligence/value-objects/event-intelligence-ids.vo.js";
import { createDeadlineResolution } from "../../src/market-design/deadlines/entities/deadline-resolution.entity.js";
import { DeadlineBasisType } from "../../src/market-design/enums/deadline-basis-type.enum.js";
import { createDeadlineResolutionId } from "../../src/market-design/value-objects/market-design-ids.vo.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
import { createSequenceMarketDefinitionId } from "../../src/frontier-markets/value-objects/frontier-market-ids.vo.js";
import {
  createDisplayLabel,
  createSemanticDefinition,
} from "../../src/frontier-markets/value-objects/frontier-text.vo.js";
import { createSequenceTargetKey } from "../../src/frontier-markets/value-objects/sequence-target-key.vo.js";
import { createSequenceTarget } from "../../src/frontier-markets/sequence/entities/sequence-target.entity.js";
import { createSequenceMarketDefinition } from "../../src/frontier-markets/sequence/entities/sequence-market-definition.entity.js";
import { CompletionPolicy } from "../../src/frontier-markets/enums/completion-policy.enum.js";
import { RequiredOrderPolicy } from "../../src/frontier-markets/enums/required-order-policy.enum.js";
import { SequenceValidationStatus } from "../../src/frontier-markets/enums/sequence-validation-status.enum.js";
import { validateSequenceMarketDefinition } from "../../src/frontier-markets/validators/validate-sequence-market-definition.js";

const makeDeadlineResolution = () =>
  createDeadlineResolution({
    id: createDeadlineResolutionId("dlr_frontier02"),
    canonical_event_id: createCanonicalEventIntelligenceId("cevt_frontier002"),
    event_deadline: createTimestamp("2026-11-20T10:00:00.000Z"),
    market_close_time: createTimestamp("2026-11-20T09:00:00.000Z"),
    resolution_cutoff_nullable: null,
    timezone: "UTC",
    deadline_basis_type: DeadlineBasisType.EVENT_TIME,
    deadline_basis_reference: "canonical_event.time_window.end_at",
    confidence: 0.9,
    warnings: [],
  });

const makeSequenceTarget = (key: string, required: boolean) =>
  createSequenceTarget({
    target_key: createSequenceTargetKey(key),
    canonical_event_ref_or_predicate: {
      kind: "canonical_event_ref",
      canonical_event_id: createCanonicalEventIntelligenceId("cevt_frontier002"),
    },
    display_label: createDisplayLabel(`Step ${key}`),
    semantic_definition: createSemanticDefinition(`Definition ${key}`),
    required,
  });

const makeValidSequenceDefinition = () =>
  createSequenceMarketDefinition({
    id: createSequenceMarketDefinitionId("fse_frontier001"),
    version: createEntityVersion(1),
    parent_event_graph_context_id: createEventGraphNodeId("egnd_frontier001"),
    sequence_targets: [makeSequenceTarget("first", true), makeSequenceTarget("second", false)],
    required_order_policy: RequiredOrderPolicy.STRICT,
    completion_policy: CompletionPolicy.ALL_REQUIRED,
    deadline_resolution: makeDeadlineResolution(),
    sequence_validation_status: SequenceValidationStatus.REVIEW_REQUIRED,
    metadata: {},
  });

describe("SequenceMarketDefinition", () => {
  it("valid SequenceMarketDefinition", () => {
    const report = validateSequenceMarketDefinition(makeValidSequenceDefinition());
    expect(report.isValid).toBe(true);
  });

  it("invalid SequenceMarketDefinition with missing required targets", () => {
    const invalid = {
      ...makeValidSequenceDefinition(),
      sequence_targets: [makeSequenceTarget("first", false), makeSequenceTarget("second", false)],
      sequence_validation_status: SequenceValidationStatus.VALID,
    };
    const report = validateSequenceMarketDefinition(invalid);
    expect(report.isValid).toBe(false);
  });
});
