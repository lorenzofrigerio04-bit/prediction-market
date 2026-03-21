import { describe, expect, it } from "vitest";
import { createWorkflowInstance } from "@/entities/workflow-instance.entity.js";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createTimestamp } from "@/value-objects/timestamp.vo.js";
import { WorkflowState } from "@/enums/workflow-state.enum.js";
import { WorkflowTransition } from "@/enums/workflow-transition.enum.js";
import {
  applyTransition,
  canTransition,
  createInitialWorkflowTransition,
  getNextState,
} from "@/workflow/foundation-workflow.machine.js";
import { FOUNDATION_WORKFLOW_RULES } from "@/workflow/foundation-workflow.rules.js";
import { validateWorkflowInstance } from "@/validators/workflow-instance.validator.js";

describe("workflow machine", () => {
  it("matches transition map for all state/transition pairs", () => {
    const states = Object.values(WorkflowState);
    const transitions = Object.values(WorkflowTransition).filter(
      (transition) => transition !== WorkflowTransition.INITIALIZE,
    );

    for (const state of states) {
      for (const transition of transitions) {
        const expected = FOUNDATION_WORKFLOW_RULES[state][transition] ?? null;
        expect(canTransition(state, transition)).toBe(expected !== null);
        expect(getNextState(state, transition)).toBe(expected);
      }
    }
  });

  it("rejects illegal transition and non-monotonic timestamp", () => {
    const initialRecord = createInitialWorkflowTransition(
      createTimestamp("2026-01-01T00:00:00.000Z"),
    );
    const instance = createWorkflowInstance({
      workflowId: "wf_001",
      targetType: "CanonicalEvent",
      targetId: "evt_abcdefg",
      currentState: WorkflowState.DRAFT,
      previousState: null,
      transitionHistory: [initialRecord],
      lastTransitionAt: initialRecord.at,
      entityVersion: createEntityVersion(),
    });
    expect(() =>
      applyTransition(instance, WorkflowTransition.FINALIZE, {
        at: createTimestamp("2026-01-02T00:00:00.000Z"),
      }),
    ).toThrow();

    expect(() =>
      applyTransition(instance, WorkflowTransition.VALIDATE, {
        at: createTimestamp("2025-12-31T00:00:00.000Z"),
      }),
    ).toThrow();
  });

  it("supports legal lifecycle with initialize/reject/reopen/archive policy", () => {
    const initialRecord = createInitialWorkflowTransition(
      createTimestamp("2026-01-01T00:00:00.000Z"),
    );
    const instance = createWorkflowInstance({
      workflowId: "wf_002",
      targetType: "CanonicalEvent",
      targetId: "evt_abcdefh",
      currentState: WorkflowState.DRAFT,
      previousState: null,
      transitionHistory: [initialRecord],
      lastTransitionAt: initialRecord.at,
      entityVersion: createEntityVersion(),
    });

    const validated = applyTransition(instance, WorkflowTransition.VALIDATE, {
      at: createTimestamp("2026-01-02T00:00:00.000Z"),
      reason: "schema pass",
      actor: "system",
    });
    const canonical = applyTransition(validated, WorkflowTransition.CANONICALIZE, {
      at: createTimestamp("2026-01-03T00:00:00.000Z"),
      actor: "system",
    });
    const claimDerived = applyTransition(canonical, WorkflowTransition.DERIVE_CLAIM, {
      at: createTimestamp("2026-01-04T00:00:00.000Z"),
      actor: "system",
    });
    const marketComposed = applyTransition(claimDerived, WorkflowTransition.COMPOSE_MARKET, {
      at: createTimestamp("2026-01-05T00:00:00.000Z"),
      actor: "system",
    });
    const finalized = applyTransition(marketComposed, WorkflowTransition.FINALIZE, {
      at: createTimestamp("2026-01-06T00:00:00.000Z"),
      actor: "editor",
    });
    const rejected = applyTransition(finalized, WorkflowTransition.REJECT, {
      at: createTimestamp("2026-01-07T00:00:00.000Z"),
      actor: "editor",
    });
    const rejectedAgain = applyTransition(rejected, WorkflowTransition.REJECT, {
      at: createTimestamp("2026-01-08T00:00:00.000Z"),
      actor: "editor",
    });
    const reopened = applyTransition(rejectedAgain, WorkflowTransition.REOPEN, {
      at: createTimestamp("2026-01-09T00:00:00.000Z"),
      actor: "editor",
    });
    const revalidated = applyTransition(reopened, WorkflowTransition.VALIDATE, {
      at: createTimestamp("2026-01-10T00:00:00.000Z"),
      actor: "system",
    });
    const reCanonical = applyTransition(revalidated, WorkflowTransition.CANONICALIZE, {
      at: createTimestamp("2026-01-11T00:00:00.000Z"),
      actor: "system",
    });
    const reClaimDerived = applyTransition(reCanonical, WorkflowTransition.DERIVE_CLAIM, {
      at: createTimestamp("2026-01-12T00:00:00.000Z"),
      actor: "system",
    });
    const reMarketComposed = applyTransition(reClaimDerived, WorkflowTransition.COMPOSE_MARKET, {
      at: createTimestamp("2026-01-13T00:00:00.000Z"),
      actor: "system",
    });
    const reFinalized = applyTransition(reMarketComposed, WorkflowTransition.FINALIZE, {
      at: createTimestamp("2026-01-14T00:00:00.000Z"),
      actor: "editor",
    });
    const archived = applyTransition(reFinalized, WorkflowTransition.ARCHIVE, {
      at: createTimestamp("2026-01-15T00:00:00.000Z"),
      actor: "editor",
    });

    expect(validated.previousState).toBe(WorkflowState.DRAFT);
    expect(rejected.currentState).toBe(WorkflowState.REJECTED);
    expect(reopened.currentState).toBe(WorkflowState.DRAFT);
    expect(archived.currentState).toBe(WorkflowState.ARCHIVED);
    expect(archived.transitionHistory.length).toBeGreaterThan(8);

    const report = validateWorkflowInstance(archived);
    expect(report.isValid).toBe(true);

    expect(() =>
      applyTransition(archived, WorkflowTransition.REOPEN, {
        at: createTimestamp("2026-01-16T00:00:00.000Z"),
        actor: "editor",
      }),
    ).toThrow();
  });

  it("detects illegal transition history through validator", () => {
    const initialRecord = createInitialWorkflowTransition(
      createTimestamp("2026-01-01T00:00:00.000Z"),
    );
    const invalid = createWorkflowInstance({
      workflowId: "wf_003",
      targetType: "CanonicalEvent",
      targetId: "evt_abcdefz",
      currentState: WorkflowState.DRAFT,
      previousState: null,
      transitionHistory: [initialRecord],
      lastTransitionAt: initialRecord.at,
      entityVersion: createEntityVersion(),
    });

    const brokenHistory = {
      ...invalid,
      currentState: WorkflowState.CANONICAL,
      previousState: WorkflowState.DRAFT,
      transitionHistory: [
        ...invalid.transitionHistory,
        {
          from: WorkflowState.DRAFT,
          to: WorkflowState.CANONICAL,
          transition: WorkflowTransition.CANONICALIZE,
          at: createTimestamp("2026-01-02T00:00:00.000Z"),
          reason: null,
          actor: null,
        },
      ],
      lastTransitionAt: createTimestamp("2026-01-02T00:00:00.000Z"),
    };

    const report = validateWorkflowInstance(brokenHistory as never);
    expect(report.isValid).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("INVALID_STATE_TRANSITION");
  });
});
