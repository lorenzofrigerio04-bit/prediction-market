import { describe, expect, it } from "vitest";
import { createSourceRecord } from "@/entities/source-record.entity.js";
import { createEventSignal } from "@/entities/event-signal.entity.js";
import { createCanonicalEvent } from "@/entities/canonical-event.entity.js";
import { createStructuredClaim } from "@/entities/structured-claim.entity.js";
import { createMarketOutcome } from "@/entities/market-outcome.entity.js";
import { createCandidateMarket } from "@/entities/candidate-market.entity.js";
import { createWorkflowInstance } from "@/entities/workflow-instance.entity.js";
import { ClaimPolarity } from "@/enums/claim-polarity.enum.js";
import { CandidateOutcomeType } from "@/enums/candidate-outcome-type.enum.js";
import { EventCategory } from "@/enums/event-category.enum.js";
import { EventPriority } from "@/enums/event-priority.enum.js";
import { EventStatus } from "@/enums/event-status.enum.js";
import { MarketResolutionBasis } from "@/enums/market-resolution-basis.enum.js";
import { MarketType } from "@/enums/market-type.enum.js";
import { SourceType } from "@/enums/source-type.enum.js";
import { WorkflowState } from "@/enums/workflow-state.enum.js";
import { WorkflowTransition } from "@/enums/workflow-transition.enum.js";
import { validateCandidateMarket } from "@/validators/candidate-market.validator.js";
import { validateCanonicalEvent } from "@/validators/canonical-event.validator.js";
import { validateEventSignal } from "@/validators/event-signal.validator.js";
import { validateSourceRecord } from "@/validators/source-record.validator.js";
import { validateStructuredClaim } from "@/validators/structured-claim.validator.js";
import { validateWorkflowInstance } from "@/validators/workflow-instance.validator.js";
import {
  applyTransition,
  createInitialWorkflowTransition,
} from "@/workflow/foundation-workflow.machine.js";
import {
  createCandidateMarketId,
  createClaimId,
  createConfidenceScore,
  createDescription,
  createEntityVersion,
  createEventId,
  createOutcomeId,
  createResolutionWindow,
  createSlug,
  createSourceId,
  createTag,
  createTimestamp,
  createTitle,
} from "@/index.js";

describe("foundation-layer integration flow", () => {
  it("constructs and validates full domain chain in memory", () => {
    const srcId = createSourceId("src_abcdefg");
    const signalId = createEventId("evt_signalx");
    const eventId = createEventId("evt_abcdefg");
    const claimId = createClaimId("clm_abcdefg");

    const source = createSourceRecord({
      id: srcId,
      sourceType: SourceType.NEWS_ARTICLE,
      sourceName: "Reuters",
      sourceAuthorityScore: createConfidenceScore(0.9),
      title: createTitle("US inflation beats expectations"),
      description: createDescription("Latest CPI print beats analyst estimates."),
      url: null,
      publishedAt: createTimestamp("2026-03-01T08:00:00.000Z"),
      capturedAt: createTimestamp("2026-03-01T09:00:00.000Z"),
      locale: null,
      tags: [createTag("macro"), createTag("inflation")],
      externalRef: "reuters-123",
      entityVersion: createEntityVersion(),
    });

    const signal = createEventSignal({
      id: signalId,
      sourceRecordIds: [srcId],
      rawHeadline: createTitle("US CPI rises"),
      rawSummary: createDescription("Detected macroeconomic event."),
      eventCategory: EventCategory.ECONOMICS,
      eventPriority: EventPriority.HIGH,
      occurredAt: createTimestamp("2026-03-01T08:30:00.000Z"),
      detectedAt: createTimestamp("2026-03-01T09:00:00.000Z"),
      jurisdictions: ["US"],
      involvedEntities: ["BLS"],
      tags: [createTag("economics")],
      confidenceScore: createConfidenceScore(0.82),
      entityVersion: createEntityVersion(),
    });

    const canonicalEvent = createCanonicalEvent({
      id: eventId,
      title: createTitle("US CPI March release"),
      slug: createSlug("US CPI March release"),
      description: createDescription("Canonicalized CPI release event."),
      category: EventCategory.ECONOMICS,
      priority: EventPriority.HIGH,
      status: EventStatus.CANONICALIZED,
      occurredAt: createTimestamp("2026-03-01T08:30:00.000Z"),
      firstObservedAt: createTimestamp("2026-03-01T09:00:00.000Z"),
      lastUpdatedAt: createTimestamp("2026-03-01T10:00:00.000Z"),
      jurisdictions: ["US"],
      involvedEntities: ["BLS"],
      supportingSourceRecordIds: [srcId],
      supportingSignalIds: [signalId],
      tags: [createTag("economics")],
      confidenceScore: createConfidenceScore(0.86),
      resolutionWindow: createResolutionWindow(
        "2026-03-01T08:00:00.000Z",
        "2026-03-31T23:59:59.000Z",
      ),
      entityVersion: createEntityVersion(),
    });

    const claim = createStructuredClaim({
      id: claimId,
      canonicalEventId: eventId,
      claimText: "US CPI YoY will be above 3.0% for March 2026 release.",
      normalizedClaimText: "us cpi yoy above 3.0 march 2026 release",
      polarity: ClaimPolarity.AFFIRMATIVE,
      claimSubject: "US CPI YoY",
      claimPredicate: "above 3.0%",
      claimObject: null,
      resolutionBasis: MarketResolutionBasis.OFFICIAL_SOURCE,
      resolutionWindow: createResolutionWindow(
        "2026-03-01T08:00:00.000Z",
        "2026-03-31T23:59:59.000Z",
      ),
      confidenceScore: createConfidenceScore(0.78),
      sourceRecordIds: [srcId],
      tags: [createTag("macro")],
      entityVersion: createEntityVersion(),
    });

    const outcomeYes = createMarketOutcome({
      id: createOutcomeId("out_yesabcd"),
      outcomeType: CandidateOutcomeType.YES,
      label: "Yes",
      shortLabel: "Y",
      description: null,
      orderIndex: 0,
      probabilityHint: null,
      entityVersion: createEntityVersion(),
    });
    const outcomeNo = createMarketOutcome({
      id: createOutcomeId("out_noabcde"),
      outcomeType: CandidateOutcomeType.NO,
      label: "No",
      shortLabel: "N",
      description: null,
      orderIndex: 1,
      probabilityHint: null,
      entityVersion: createEntityVersion(),
    });

    const market = createCandidateMarket({
      id: createCandidateMarketId("mkt_abcdefg"),
      claimId,
      canonicalEventId: eventId,
      title: createTitle("Will US CPI YoY exceed 3.0% in March 2026 release?"),
      slug: createSlug("Will US CPI YoY exceed 3.0% in March 2026 release?"),
      description: createDescription("Candidate binary market generated from structured claim."),
      resolutionBasis: MarketResolutionBasis.OFFICIAL_SOURCE,
      resolutionWindow: createResolutionWindow(
        "2026-03-01T08:00:00.000Z",
        "2026-03-31T23:59:59.000Z",
      ),
      outcomes: [outcomeYes, outcomeNo],
      marketType: MarketType.BINARY,
      categories: ["economics"],
      tags: [createTag("macro")],
      confidenceScore: createConfidenceScore(0.81),
      draftNotes: null,
      entityVersion: createEntityVersion(),
    });

    const initial = createInitialWorkflowTransition(createTimestamp("2026-03-01T09:05:00.000Z"));
    let workflow = createWorkflowInstance({
      workflowId: "wf_integration_1",
      targetType: "CanonicalEvent",
      targetId: eventId,
      currentState: WorkflowState.DRAFT,
      previousState: null,
      transitionHistory: [initial],
      lastTransitionAt: initial.at,
      entityVersion: createEntityVersion(),
    });
    workflow = applyTransition(workflow, WorkflowTransition.VALIDATE, {
      at: createTimestamp("2026-03-01T09:10:00.000Z"),
      actor: "system",
    });
    workflow = applyTransition(workflow, WorkflowTransition.CANONICALIZE, {
      at: createTimestamp("2026-03-01T09:20:00.000Z"),
      actor: "system",
    });
    workflow = applyTransition(workflow, WorkflowTransition.DERIVE_CLAIM, {
      at: createTimestamp("2026-03-01T09:30:00.000Z"),
      actor: "system",
    });
    workflow = applyTransition(workflow, WorkflowTransition.COMPOSE_MARKET, {
      at: createTimestamp("2026-03-01T09:40:00.000Z"),
      actor: "system",
    });
    workflow = applyTransition(workflow, WorkflowTransition.FINALIZE, {
      at: createTimestamp("2026-03-01T09:50:00.000Z"),
      actor: "editor",
    });
    workflow = applyTransition(workflow, WorkflowTransition.REJECT, {
      at: createTimestamp("2026-03-01T09:55:00.000Z"),
      actor: "editor",
    });
    workflow = applyTransition(workflow, WorkflowTransition.REOPEN, {
      at: createTimestamp("2026-03-01T10:00:00.000Z"),
      actor: "editor",
    });
    workflow = applyTransition(workflow, WorkflowTransition.VALIDATE, {
      at: createTimestamp("2026-03-01T10:05:00.000Z"),
      actor: "system",
    });
    workflow = applyTransition(workflow, WorkflowTransition.CANONICALIZE, {
      at: createTimestamp("2026-03-01T10:10:00.000Z"),
      actor: "system",
    });
    workflow = applyTransition(workflow, WorkflowTransition.DERIVE_CLAIM, {
      at: createTimestamp("2026-03-01T10:15:00.000Z"),
      actor: "system",
    });
    workflow = applyTransition(workflow, WorkflowTransition.COMPOSE_MARKET, {
      at: createTimestamp("2026-03-01T10:20:00.000Z"),
      actor: "system",
    });
    workflow = applyTransition(workflow, WorkflowTransition.FINALIZE, {
      at: createTimestamp("2026-03-01T10:25:00.000Z"),
      actor: "editor",
    });
    workflow = applyTransition(workflow, WorkflowTransition.ARCHIVE, {
      at: createTimestamp("2026-03-01T10:30:00.000Z"),
      actor: "editor",
    });

    expect(validateSourceRecord(source).isValid).toBe(true);
    expect(validateEventSignal(signal).isValid).toBe(true);
    expect(validateCanonicalEvent(canonicalEvent).isValid).toBe(true);
    expect(validateStructuredClaim(claim).isValid).toBe(true);
    expect(validateCandidateMarket(market).isValid).toBe(true);
    expect(validateWorkflowInstance(workflow).isValid).toBe(true);
    expect(workflow.currentState).toBe(WorkflowState.ARCHIVED);
  });
});
