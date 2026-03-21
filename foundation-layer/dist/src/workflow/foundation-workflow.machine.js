import { WorkflowError } from "../common/errors/workflow-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { WorkflowState } from "../enums/workflow-state.enum.js";
import { WorkflowTransition } from "../enums/workflow-transition.enum.js";
import { FOUNDATION_WORKFLOW_RULES } from "./foundation-workflow.rules.js";
export const canTransition = (from, transition) => FOUNDATION_WORKFLOW_RULES[from][transition] !== undefined;
export const getNextState = (from, transition) => FOUNDATION_WORKFLOW_RULES[from][transition] ?? null;
export const applyTransition = (instance, transition, metadata) => {
    if (Date.parse(metadata.at) < Date.parse(instance.lastTransitionAt)) {
        throw new WorkflowError("INVALID_TRANSITION_SEQUENCE", "Transition timestamp must be monotonic", {
            lastTransitionAt: instance.lastTransitionAt,
            attemptedAt: metadata.at,
        });
    }
    const nextState = getNextState(instance.currentState, transition);
    if (nextState === null) {
        throw new WorkflowError("INVALID_STATE_TRANSITION", `Transition ${transition} is not allowed from ${instance.currentState}`, {
            currentState: instance.currentState,
            transition,
        });
    }
    const newRecord = deepFreeze({
        from: instance.currentState,
        to: nextState,
        transition,
        at: metadata.at,
        reason: metadata.reason ?? null,
        actor: metadata.actor ?? null,
    });
    const transitionHistory = [...instance.transitionHistory, newRecord];
    return deepFreeze({
        ...instance,
        previousState: instance.currentState,
        currentState: nextState,
        transitionHistory,
        lastTransitionAt: metadata.at,
    });
};
export const createInitialWorkflowTransition = (at) => deepFreeze({
    from: null,
    to: WorkflowState.DRAFT,
    transition: WorkflowTransition.INITIALIZE,
    at,
    reason: "initial",
    actor: null,
});
//# sourceMappingURL=foundation-workflow.machine.js.map