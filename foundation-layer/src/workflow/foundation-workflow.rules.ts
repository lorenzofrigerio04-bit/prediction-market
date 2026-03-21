import { WorkflowState } from "../enums/workflow-state.enum.js";
import { WorkflowTransition } from "../enums/workflow-transition.enum.js";
import type { TransitionRuleMap } from "./foundation-workflow.types.js";

export const FOUNDATION_WORKFLOW_RULES: TransitionRuleMap = {
  [WorkflowState.DRAFT]: {
    [WorkflowTransition.VALIDATE]: WorkflowState.VALIDATED,
    [WorkflowTransition.REJECT]: WorkflowState.REJECTED,
  },
  [WorkflowState.VALIDATED]: {
    [WorkflowTransition.CANONICALIZE]: WorkflowState.CANONICAL,
    [WorkflowTransition.REJECT]: WorkflowState.REJECTED,
  },
  [WorkflowState.CANONICAL]: {
    [WorkflowTransition.DERIVE_CLAIM]: WorkflowState.CLAIM_DERIVED,
    [WorkflowTransition.REJECT]: WorkflowState.REJECTED,
  },
  [WorkflowState.CLAIM_DERIVED]: {
    [WorkflowTransition.COMPOSE_MARKET]: WorkflowState.MARKET_COMPOSED,
    [WorkflowTransition.REJECT]: WorkflowState.REJECTED,
  },
  [WorkflowState.MARKET_COMPOSED]: {
    [WorkflowTransition.FINALIZE]: WorkflowState.FINALIZED,
    [WorkflowTransition.REJECT]: WorkflowState.REJECTED,
  },
  [WorkflowState.FINALIZED]: {
    [WorkflowTransition.ARCHIVE]: WorkflowState.ARCHIVED,
    [WorkflowTransition.REJECT]: WorkflowState.REJECTED,
  },
  [WorkflowState.REJECTED]: {
    [WorkflowTransition.REJECT]: WorkflowState.REJECTED,
    [WorkflowTransition.REOPEN]: WorkflowState.DRAFT,
    [WorkflowTransition.ARCHIVE]: WorkflowState.ARCHIVED,
  },
  [WorkflowState.ARCHIVED]: {},
};
