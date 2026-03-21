import { describe, expect, it } from "vitest";
import { ValidationError } from "@/common/errors/validation-error.js";
import { createCandidateMarket } from "@/entities/candidate-market.entity.js";
import { createCanonicalEvent } from "@/entities/canonical-event.entity.js";
import { createEventSignal } from "@/entities/event-signal.entity.js";
import { createMarketOutcome } from "@/entities/market-outcome.entity.js";
import { createSourceRecord } from "@/entities/source-record.entity.js";
import { createStructuredClaim } from "@/entities/structured-claim.entity.js";
import { createValidationReport } from "@/entities/validation-report.entity.js";
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
import { ValidatorSeverity } from "@/enums/validator-severity.enum.js";
import { createInitialWorkflowTransition } from "@/workflow/foundation-workflow.machine.js";
import { canonicalEventSchema, CANONICAL_EVENT_SCHEMA_ID } from "@/schemas/entities/canonical-event.schema.js";
import { candidateMarketSchema, CANDIDATE_MARKET_SCHEMA_ID } from "@/schemas/entities/candidate-market.schema.js";
import { eventSignalSchema, EVENT_SIGNAL_SCHEMA_ID } from "@/schemas/entities/event-signal.schema.js";
import { marketOutcomeSchema, MARKET_OUTCOME_SCHEMA_ID } from "@/schemas/entities/market-outcome.schema.js";
import { sourceRecordSchema, SOURCE_RECORD_SCHEMA_ID } from "@/schemas/entities/source-record.schema.js";
import { structuredClaimSchema, STRUCTURED_CLAIM_SCHEMA_ID } from "@/schemas/entities/structured-claim.schema.js";
import { validationReportSchema, VALIDATION_REPORT_SCHEMA_ID } from "@/schemas/entities/validation-report.schema.js";
import { workflowInstanceSchema, WORKFLOW_INSTANCE_SCHEMA_ID } from "@/schemas/entities/workflow-instance.schema.js";
import { ajv } from "@/validators/ajv/ajv-instance.js";
import { validateCandidateMarket } from "@/validators/candidate-market.validator.js";
import { validateCanonicalEvent } from "@/validators/canonical-event.validator.js";
import { validateEventSignal } from "@/validators/event-signal.validator.js";
import { validateMarketOutcome } from "@/validators/market-outcome.validator.js";
import { validateSourceRecord } from "@/validators/source-record.validator.js";
import { validateStructuredClaim } from "@/validators/structured-claim.validator.js";
import { validateValidationReport } from "@/validators/validation-report.validator.js";
import { validateWorkflowInstance } from "@/validators/workflow-instance.validator.js";
import { createCandidateMarketId, createClaimId, createConfidenceScore, createDescription, createEntityVersion, createEventId, createOutcomeId, createResolutionWindow, createSlug, createSourceId, createTag, createTimestamp, createTitle, } from "@/index.js";
describe("missing schema fail-fast", () => {
    const sourceId = createSourceId("src_abcdefg");
    const eventId = createEventId("evt_abcdefg");
    const signalId = createEventId("evt_abcdefh");
    const claimId = createClaimId("clm_abcdefg");
    const outcomeYes = createMarketOutcome({
        id: createOutcomeId("out_abcdefg"),
        outcomeType: CandidateOutcomeType.YES,
        label: "Yes",
        shortLabel: null,
        description: null,
        orderIndex: 0,
        probabilityHint: null,
        entityVersion: createEntityVersion(),
    });
    const outcomeNo = createMarketOutcome({
        id: createOutcomeId("out_abcdefh"),
        outcomeType: CandidateOutcomeType.NO,
        label: "No",
        shortLabel: null,
        description: null,
        orderIndex: 1,
        probabilityHint: null,
        entityVersion: createEntityVersion(),
    });
    const sourceRecord = createSourceRecord({
        id: sourceId,
        sourceType: SourceType.NEWS_ARTICLE,
        sourceName: "Reuters",
        sourceAuthorityScore: createConfidenceScore(0.9),
        title: createTitle("Headline"),
        description: createDescription("Summary"),
        url: null,
        publishedAt: null,
        capturedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
        locale: null,
        tags: [createTag("news")],
        externalRef: null,
        entityVersion: createEntityVersion(),
    });
    const eventSignal = createEventSignal({
        id: signalId,
        sourceRecordIds: [sourceId],
        rawHeadline: createTitle("Signal"),
        rawSummary: null,
        eventCategory: EventCategory.GENERAL,
        eventPriority: EventPriority.MEDIUM,
        occurredAt: null,
        detectedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
        jurisdictions: ["US"],
        involvedEntities: ["Entity"],
        tags: [createTag("news")],
        confidenceScore: createConfidenceScore(0.5),
        entityVersion: createEntityVersion(),
    });
    const canonicalEvent = createCanonicalEvent({
        id: eventId,
        title: createTitle("Canonical"),
        slug: createSlug("Canonical"),
        description: createDescription("Canonical event"),
        category: EventCategory.GENERAL,
        priority: EventPriority.MEDIUM,
        status: EventStatus.CANONICALIZED,
        occurredAt: null,
        firstObservedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
        lastUpdatedAt: createTimestamp("2026-03-01T00:10:00.000Z"),
        jurisdictions: ["US"],
        involvedEntities: ["Entity"],
        supportingSourceRecordIds: [sourceId],
        supportingSignalIds: [signalId],
        tags: [createTag("news")],
        confidenceScore: createConfidenceScore(0.6),
        resolutionWindow: null,
        entityVersion: createEntityVersion(),
    });
    const structuredClaim = createStructuredClaim({
        id: claimId,
        canonicalEventId: eventId,
        claimText: "Claim text",
        normalizedClaimText: "claim text",
        polarity: ClaimPolarity.AFFIRMATIVE,
        claimSubject: "Subject",
        claimPredicate: "Predicate",
        claimObject: null,
        resolutionBasis: MarketResolutionBasis.OFFICIAL_SOURCE,
        resolutionWindow: createResolutionWindow("2026-03-01T00:00:00.000Z", "2026-03-02T00:00:00.000Z"),
        confidenceScore: createConfidenceScore(0.7),
        sourceRecordIds: [sourceId],
        tags: [createTag("news")],
        entityVersion: createEntityVersion(),
    });
    const candidateMarket = createCandidateMarket({
        id: createCandidateMarketId("mkt_abcdefg"),
        claimId,
        canonicalEventId: eventId,
        title: createTitle("Market"),
        slug: createSlug("Market"),
        description: createDescription("Market desc"),
        resolutionBasis: MarketResolutionBasis.OFFICIAL_SOURCE,
        resolutionWindow: createResolutionWindow("2026-03-01T00:00:00.000Z", "2026-03-02T00:00:00.000Z"),
        outcomes: [outcomeYes, outcomeNo],
        marketType: MarketType.BINARY,
        categories: ["general"],
        tags: [createTag("news")],
        confidenceScore: createConfidenceScore(0.8),
        draftNotes: null,
        entityVersion: createEntityVersion(),
    });
    const initialTransition = createInitialWorkflowTransition(createTimestamp("2026-03-01T00:00:00.000Z"));
    const workflowInstance = createWorkflowInstance({
        workflowId: "wf_1",
        targetType: "CanonicalEvent",
        targetId: eventId,
        currentState: WorkflowState.DRAFT,
        previousState: null,
        transitionHistory: [initialTransition],
        lastTransitionAt: initialTransition.at,
        entityVersion: createEntityVersion(),
    });
    const validationReport = createValidationReport({
        targetType: "SourceRecord",
        targetId: sourceId,
        isValid: true,
        issues: [
            {
                code: "X",
                path: "/",
                message: "msg",
                severity: ValidatorSeverity.INFO,
            },
        ],
        generatedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
    });
    const expectFailFast = (schemaId, schema, runValidator) => {
        ajv.removeSchema(schemaId);
        try {
            try {
                runValidator();
                throw new Error("Expected schema lookup to fail");
            }
            catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const typedError = error;
                expect(typedError.code).toBe("SCHEMA_NOT_REGISTERED");
            }
        }
        finally {
            ajv.addSchema(schema);
        }
    };
    it("throws when required validator schemas are missing", () => {
        expectFailFast(SOURCE_RECORD_SCHEMA_ID, sourceRecordSchema, () => validateSourceRecord(sourceRecord));
        expectFailFast(EVENT_SIGNAL_SCHEMA_ID, eventSignalSchema, () => validateEventSignal(eventSignal));
        expectFailFast(CANONICAL_EVENT_SCHEMA_ID, canonicalEventSchema, () => validateCanonicalEvent(canonicalEvent));
        expectFailFast(STRUCTURED_CLAIM_SCHEMA_ID, structuredClaimSchema, () => validateStructuredClaim(structuredClaim));
        expectFailFast(MARKET_OUTCOME_SCHEMA_ID, marketOutcomeSchema, () => validateMarketOutcome(outcomeYes));
        expectFailFast(CANDIDATE_MARKET_SCHEMA_ID, candidateMarketSchema, () => validateCandidateMarket(candidateMarket));
        expectFailFast(WORKFLOW_INSTANCE_SCHEMA_ID, workflowInstanceSchema, () => validateWorkflowInstance(workflowInstance));
        expectFailFast(VALIDATION_REPORT_SCHEMA_ID, validationReportSchema, () => validateValidationReport(validationReport));
    });
});
//# sourceMappingURL=missing-schema.spec.js.map