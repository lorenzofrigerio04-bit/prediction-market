import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { WorkflowState } from "../enums/workflow-state.enum.js";
import { WorkflowTransition } from "../enums/workflow-transition.enum.js";
import { FOUNDATION_WORKFLOW_RULES } from "../workflow/foundation-workflow.rules.js";
import type { EntityVersion } from "../value-objects/entity-version.vo.js";
import type { Timestamp } from "../value-objects/timestamp.vo.js";

export type WorkflowTransitionRecord = Readonly<{
  from: WorkflowState | null;
  to: WorkflowState;
  transition: WorkflowTransition;
  at: Timestamp;
  reason: string | null;
  actor: string | null;
}>;

export type WorkflowInstance = Readonly<{
  workflowId: string;
  targetType: string;
  targetId: string;
  currentState: WorkflowState;
  previousState: WorkflowState | null;
  transitionHistory: readonly WorkflowTransitionRecord[];
  lastTransitionAt: Timestamp;
  entityVersion: EntityVersion;
}>;

export const createWorkflowInstance = (input: WorkflowInstance): WorkflowInstance => {
  if (input.transitionHistory.length === 0) {
    throw new ValidationError(
      "EMPTY_WORKFLOW_HISTORY",
      "transitionHistory must contain at least one record",
    );
  }

  const latest = input.transitionHistory[input.transitionHistory.length - 1];
  if (latest === undefined) {
    throw new ValidationError("EMPTY_WORKFLOW_HISTORY", "Missing latest transition");
  }
  if (latest.to !== input.currentState) {
    throw new ValidationError(
      "WORKFLOW_CURRENT_STATE_MISMATCH",
      "currentState must equal latest history target state",
    );
  }
  if (latest.at !== input.lastTransitionAt) {
    throw new ValidationError(
      "WORKFLOW_LAST_TRANSITION_MISMATCH",
      "lastTransitionAt must equal latest history timestamp",
    );
  }
  if (input.previousState !== latest.from) {
    throw new ValidationError(
      "WORKFLOW_PREVIOUS_STATE_MISMATCH",
      "previousState must equal latest history from state",
    );
  }
  for (let index = 1; index < input.transitionHistory.length; index += 1) {
    const previous = input.transitionHistory[index - 1]!;
    const current = input.transitionHistory[index]!;
    if (current.from !== previous.to) {
      throw new ValidationError(
        "INVALID_TRANSITION_SEQUENCE",
        "transitionHistory must be state-continuous",
      );
    }
    if (Date.parse(previous.at) > Date.parse(current.at)) {
      throw new ValidationError(
        "WORKFLOW_HISTORY_NOT_MONOTONIC",
        "transitionHistory must be sorted by ascending timestamp",
      );
    }
    if (current.from === null) {
      throw new ValidationError(
        "INVALID_INITIAL_TRANSITION",
        "Only the first transition may start from null",
      );
    }
    const expectedState = FOUNDATION_WORKFLOW_RULES[current.from][current.transition] ?? null;
    if (expectedState !== current.to) {
      throw new ValidationError(
        "INVALID_STATE_TRANSITION",
        "transitionHistory contains illegal transition",
      );
    }
  }

  const initial = input.transitionHistory[0]!;
  if (
    initial.from !== null ||
    initial.to !== WorkflowState.DRAFT ||
    initial.transition !== WorkflowTransition.INITIALIZE
  ) {
    throw new ValidationError(
      "INVALID_INITIAL_TRANSITION",
      "Initial transition must be null -> DRAFT via INITIALIZE",
    );
  }
  return deepFreeze(input);
};
