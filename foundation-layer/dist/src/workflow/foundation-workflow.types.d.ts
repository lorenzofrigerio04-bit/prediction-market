import type { WorkflowInstance, WorkflowTransitionRecord } from "../entities/workflow-instance.entity.js";
import { WorkflowState } from "../enums/workflow-state.enum.js";
import { WorkflowTransition } from "../enums/workflow-transition.enum.js";
import type { Timestamp } from "../value-objects/timestamp.vo.js";
export type TransitionRuleMap = Readonly<Record<WorkflowState, Partial<Record<WorkflowTransition, WorkflowState>>>>;
export type ApplyTransitionMetadata = Readonly<{
    at: Timestamp;
    reason?: string | null;
    actor?: string | null;
}>;
export type WorkflowTransitionResult = Readonly<{
    nextState: WorkflowState;
    record: WorkflowTransitionRecord;
    instance: WorkflowInstance;
}>;
//# sourceMappingURL=foundation-workflow.types.d.ts.map