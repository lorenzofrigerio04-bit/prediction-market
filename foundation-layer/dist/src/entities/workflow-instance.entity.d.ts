import { WorkflowState } from "../enums/workflow-state.enum.js";
import { WorkflowTransition } from "../enums/workflow-transition.enum.js";
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
export declare const createWorkflowInstance: (input: WorkflowInstance) => WorkflowInstance;
//# sourceMappingURL=workflow-instance.entity.d.ts.map