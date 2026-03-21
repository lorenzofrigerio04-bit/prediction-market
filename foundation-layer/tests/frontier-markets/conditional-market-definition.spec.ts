import { describe, expect, it } from "vitest";
import { createEntityVersion } from "../../src/value-objects/entity-version.vo.js";
import { createCanonicalEventIntelligenceId } from "../../src/event-intelligence/value-objects/event-intelligence-ids.vo.js";
import { createDeadlineResolution } from "../../src/market-design/deadlines/entities/deadline-resolution.entity.js";
import { DeadlineBasisType } from "../../src/market-design/enums/deadline-basis-type.enum.js";
import { ContractType } from "../../src/market-design/enums/contract-type.enum.js";
import { createDeadlineResolutionId } from "../../src/market-design/value-objects/market-design-ids.vo.js";
import { createConditionalMarketDefinitionId } from "../../src/frontier-markets/value-objects/frontier-market-ids.vo.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
import { createTriggerCondition } from "../../src/frontier-markets/conditional/entities/trigger-condition.entity.js";
import { createConditionalMarketDefinition } from "../../src/frontier-markets/conditional/entities/conditional-market-definition.entity.js";
import { ActivationPolicy } from "../../src/frontier-markets/enums/activation-policy.enum.js";
import { ConditionalValidationStatus } from "../../src/frontier-markets/enums/conditional-validation-status.enum.js";
import { InvalidationPolicy } from "../../src/frontier-markets/enums/invalidation-policy.enum.js";
import { TriggerType } from "../../src/frontier-markets/enums/trigger-type.enum.js";
import { createTriggerPolicyNote } from "../../src/frontier-markets/value-objects/frontier-text.vo.js";
import { validateConditionalMarketDefinition } from "../../src/frontier-markets/validators/validate-conditional-market-definition.js";

const makeDeadlineResolution = () =>
  createDeadlineResolution({
    id: createDeadlineResolutionId("dlr_frontier03"),
    canonical_event_id: createCanonicalEventIntelligenceId("cevt_frontier003"),
    event_deadline: createTimestamp("2026-11-20T10:00:00.000Z"),
    market_close_time: createTimestamp("2026-11-20T09:00:00.000Z"),
    resolution_cutoff_nullable: null,
    timezone: "UTC",
    deadline_basis_type: DeadlineBasisType.EVENT_TIME,
    deadline_basis_reference: "canonical_event.time_window.end_at",
    confidence: 0.9,
    warnings: [],
  });

const makeTriggerCondition = () =>
  createTriggerCondition({
    trigger_type: TriggerType.UPSTREAM_EVENT,
    upstream_event_ref_or_market_ref: {
      kind: "upstream_event",
      event_id: createCanonicalEventIntelligenceId("cevt_frontier003"),
    },
    triggering_outcome: "yes",
    trigger_deadline_nullable: null,
    trigger_policy_notes: [createTriggerPolicyNote("deterministic trigger policy")],
  });

const makeValidConditionalDefinition = () =>
  createConditionalMarketDefinition({
    id: createConditionalMarketDefinitionId("fco_frontier001"),
    version: createEntityVersion(1),
    trigger_condition: makeTriggerCondition(),
    dependent_contract_type: ContractType.BINARY,
    dependent_outcome_schema: {
      schema_version: "1.0.0",
      required_outcome_keys: ["yes", "no"],
    },
    activation_policy: ActivationPolicy.EXPLICIT_TRIGGER_ONLY,
    invalidation_policy: InvalidationPolicy.INVALIDATE_IF_TRIGGER_FAILS,
    deadline_resolution: makeDeadlineResolution(),
    conditional_validation_status: ConditionalValidationStatus.TRIGGER_PENDING,
    metadata: {},
  });

describe("ConditionalMarketDefinition", () => {
  it("valid ConditionalMarketDefinition", () => {
    const report = validateConditionalMarketDefinition(makeValidConditionalDefinition());
    expect(report.isValid).toBe(true);
  });

  it("invalid ConditionalMarketDefinition without trigger condition", () => {
    const invalid = {
      ...makeValidConditionalDefinition(),
      trigger_condition: {
        ...makeTriggerCondition(),
        triggering_outcome: "",
      },
    };
    const report = validateConditionalMarketDefinition(invalid);
    expect(report.isValid).toBe(false);
  });

  it("invalid ConditionalMarketDefinition not active-ready when trigger undefined", () => {
    const invalid = {
      ...makeValidConditionalDefinition(),
      trigger_condition: {
        ...makeTriggerCondition(),
        triggering_outcome: "",
      },
      conditional_validation_status: ConditionalValidationStatus.ACTIVE_READY,
    };
    const report = validateConditionalMarketDefinition(invalid);
    expect(report.isValid).toBe(false);
  });
});
