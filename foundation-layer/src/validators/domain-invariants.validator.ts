import { errorIssue, type ValidationIssue } from "../entities/validation-report.entity.js";
import type { MarketOutcome } from "../entities/market-outcome.entity.js";
import { CandidateOutcomeType } from "../enums/candidate-outcome-type.enum.js";
import { EventStatus } from "../enums/event-status.enum.js";
import { WorkflowState } from "../enums/workflow-state.enum.js";
import { WorkflowTransition } from "../enums/workflow-transition.enum.js";
import type { CanonicalEvent } from "../entities/canonical-event.entity.js";
import type { CandidateMarket } from "../entities/candidate-market.entity.js";
import type { EventSignal } from "../entities/event-signal.entity.js";
import type { SourceRecord } from "../entities/source-record.entity.js";
import type { StructuredClaim } from "../entities/structured-claim.entity.js";
import type { WorkflowInstance } from "../entities/workflow-instance.entity.js";
import { normalizeKey } from "../common/utils/normalization.js";
import { getNextState } from "../workflow/foundation-workflow.machine.js";

const duplicates = (values: readonly string[]): readonly string[] => {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    const key = normalizeKey(value);
    if (seen.has(key)) {
      dupes.add(value);
    }
    seen.add(key);
  }
  return [...dupes];
};

export const validateSourceRecordInvariants = (
  sourceRecord: SourceRecord,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (sourceRecord.sourceName.trim().length === 0) {
    issues.push(errorIssue("INVALID_SOURCE_NAME", "/sourceName", "sourceName must be non-empty"));
  }
  if (sourceRecord.publishedAt !== null) {
    const maxFutureMs = 24 * 60 * 60 * 1000;
    if (Date.parse(sourceRecord.publishedAt) - Date.parse(sourceRecord.capturedAt) > maxFutureMs) {
      issues.push(
        errorIssue(
          "PUBLISHED_AFTER_CAPTURED_EXCESSIVE",
          "/publishedAt",
          "publishedAt cannot exceed capturedAt by more than 24h",
        ),
      );
    }
  }
  for (const duplicatedTag of duplicates(sourceRecord.tags)) {
    issues.push(errorIssue("DUPLICATE_TAG", "/tags", "Duplicate tag", { duplicatedTag }));
  }
  return issues;
};

export const validateEventSignalInvariants = (
  eventSignal: EventSignal,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (eventSignal.sourceRecordIds.length < 1) {
    issues.push(
      errorIssue(
        "MISSING_SOURCE_RECORD_IDS",
        "/sourceRecordIds",
        "At least one sourceRecordId is required",
      ),
    );
  }
  for (const duplicatedId of duplicates(eventSignal.sourceRecordIds)) {
    issues.push(errorIssue("DUPLICATE_SOURCE_ID", "/sourceRecordIds", "Duplicate sourceRecordId", { duplicatedId }));
  }
  for (const duplicatedJurisdiction of duplicates(eventSignal.jurisdictions)) {
    issues.push(
      errorIssue("DUPLICATE_JURISDICTION", "/jurisdictions", "Duplicate jurisdiction", {
        duplicatedJurisdiction,
      }),
    );
  }
  for (const duplicatedEntity of duplicates(eventSignal.involvedEntities)) {
    issues.push(
      errorIssue("DUPLICATE_INVOLVED_ENTITY", "/involvedEntities", "Duplicate involved entity", {
        duplicatedEntity,
      }),
    );
  }
  return issues;
};

export const validateCanonicalEventInvariants = (
  canonicalEvent: CanonicalEvent,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (Date.parse(canonicalEvent.firstObservedAt) > Date.parse(canonicalEvent.lastUpdatedAt)) {
    issues.push(
      errorIssue(
        "LAST_UPDATED_BEFORE_FIRST_OBSERVED",
        "/lastUpdatedAt",
        "lastUpdatedAt must be >= firstObservedAt",
      ),
    );
  }
  for (const duplicatedId of duplicates(canonicalEvent.supportingSourceRecordIds)) {
    issues.push(errorIssue("DUPLICATE_SOURCE_ID", "/supportingSourceRecordIds", "Duplicate source id", { duplicatedId }));
  }
  for (const duplicatedSignalId of duplicates(canonicalEvent.supportingSignalIds)) {
    issues.push(
      errorIssue("DUPLICATE_SIGNAL_ID", "/supportingSignalIds", "Duplicate signal id", {
        duplicatedSignalId,
      }),
    );
  }
  for (const duplicatedTag of duplicates(canonicalEvent.tags)) {
    issues.push(errorIssue("DUPLICATE_TAG", "/tags", "Duplicate tag", { duplicatedTag }));
  }
  if (
    [EventStatus.RESOLVED, EventStatus.ARCHIVED].includes(canonicalEvent.status) &&
    canonicalEvent.resolutionWindow === null
  ) {
    issues.push(
      errorIssue(
        "MISSING_RESOLUTION_WINDOW",
        "/resolutionWindow",
        "resolutionWindow required for resolved/archived status",
      ),
    );
  }
  return issues;
};

export const validateStructuredClaimInvariants = (
  structuredClaim: StructuredClaim,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (structuredClaim.sourceRecordIds.length < 1) {
    issues.push(errorIssue("MISSING_SOURCE_RECORD_IDS", "/sourceRecordIds", "At least one source id is required"));
  }
  for (const duplicatedId of duplicates(structuredClaim.sourceRecordIds)) {
    issues.push(errorIssue("DUPLICATE_SOURCE_ID", "/sourceRecordIds", "Duplicate source id", { duplicatedId }));
  }
  return issues;
};

export const validateCandidateMarketInvariants = (
  candidateMarket: CandidateMarket,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (candidateMarket.outcomes.length < 2) {
    issues.push(errorIssue("INSUFFICIENT_OUTCOMES", "/outcomes", "At least two outcomes are required"));
    return issues;
  }

  const orderSet = new Set<number>();
  const labelSet = new Set<string>();
  for (const [index, outcome] of candidateMarket.outcomes.entries()) {
    if (orderSet.has(outcome.orderIndex)) {
      issues.push(
        errorIssue("DUPLICATE_OUTCOME_ORDER_INDEX", `/outcomes/${index}/orderIndex`, "Duplicate order index"),
      );
    }
    orderSet.add(outcome.orderIndex);

    const labelKey = normalizeKey(outcome.label);
    if (labelSet.has(labelKey)) {
      issues.push(errorIssue("DUPLICATE_OUTCOME_LABEL", `/outcomes/${index}/label`, "Duplicate normalized label"));
    }
    labelSet.add(labelKey);
  }

  const outcomeTypes = new Set(candidateMarket.outcomes.map((outcome) => outcome.outcomeType));
  if (
    candidateMarket.marketType === "BINARY" &&
    (!outcomeTypes.has(CandidateOutcomeType.YES) || !outcomeTypes.has(CandidateOutcomeType.NO))
  ) {
    issues.push(
      errorIssue(
        "BINARY_MARKET_OUTCOME_MISMATCH",
        "/outcomes",
        "Binary markets require YES and NO outcomes",
      ),
    );
  }

  return issues;
};

export const validateMarketOutcomeInvariants = (
  marketOutcome: MarketOutcome,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (marketOutcome.label.trim().length === 0) {
    issues.push(errorIssue("INVALID_OUTCOME_LABEL", "/label", "label must be non-empty"));
  }
  return issues;
};

export const validateWorkflowInstanceInvariants = (
  workflowInstance: WorkflowInstance,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const history = workflowInstance.transitionHistory;
  if (history.length === 0) {
    issues.push(errorIssue("EMPTY_WORKFLOW_HISTORY", "/transitionHistory", "History must not be empty"));
    return issues;
  }

  const last = history[history.length - 1];
  if (last === undefined) {
    issues.push(errorIssue("EMPTY_WORKFLOW_HISTORY", "/transitionHistory", "History must not be empty"));
    return issues;
  }

  const initial = history[0]!;
  if (
    initial.from !== null ||
    initial.to !== WorkflowState.DRAFT ||
    initial.transition !== WorkflowTransition.INITIALIZE
  ) {
    issues.push(
      errorIssue(
        "INVALID_INITIAL_TRANSITION",
        "/transitionHistory/0",
        "Initial transition must be null -> DRAFT via INITIALIZE",
      ),
    );
  }

  if (last.to !== workflowInstance.currentState) {
    issues.push(
      errorIssue(
        "WORKFLOW_STATE_HISTORY_MISMATCH",
        "/currentState",
        "currentState must match last transition 'to' state",
      ),
    );
  }
  if (last.from !== workflowInstance.previousState) {
    issues.push(
      errorIssue(
        "WORKFLOW_STATE_HISTORY_MISMATCH",
        "/previousState",
        "previousState must match last transition 'from' state",
      ),
    );
  }
  if (last.at !== workflowInstance.lastTransitionAt) {
    issues.push(
      errorIssue(
        "WORKFLOW_LAST_TRANSITION_MISMATCH",
        "/lastTransitionAt",
        "lastTransitionAt must match last transition timestamp",
      ),
    );
  }
  for (let index = 1; index < history.length; index += 1) {
    const previous = history[index - 1]!;
    const current = history[index]!;
    if (current.from !== previous.to) {
      issues.push(
        errorIssue(
          "INVALID_TRANSITION_SEQUENCE",
          `/transitionHistory/${index}`,
          "Transition history must be state-continuous",
        ),
      );
    }

    if (current.from === null) {
      issues.push(
        errorIssue(
          "INVALID_INITIAL_TRANSITION",
          `/transitionHistory/${index}`,
          "Only first transition can start from null",
        ),
      );
    } else {
      const nextState = getNextState(current.from, current.transition);
      if (nextState !== current.to) {
        issues.push(
          errorIssue(
            "INVALID_STATE_TRANSITION",
            `/transitionHistory/${index}`,
            "Transition not allowed by workflow rules",
            {
              from: current.from,
              transition: current.transition,
              to: current.to,
            },
          ),
        );
      }
    }

    if (Date.parse(previous.at) > Date.parse(current.at)) {
      issues.push(
        errorIssue(
          "WORKFLOW_HISTORY_NOT_MONOTONIC",
          `/transitionHistory/${index}`,
          "Transition history timestamps must be monotonic",
        ),
      );
    }
  }
  return issues;
};
