import type { WorkflowInstance, WorkflowTransitionRecord } from "../entities/workflow-instance.entity.js";
import { WorkflowState } from "../enums/workflow-state.enum.js";
import { WorkflowTransition } from "../enums/workflow-transition.enum.js";
import type { ApplyTransitionMetadata } from "./foundation-workflow.types.js";
export declare const canTransition: (from: WorkflowState, transition: WorkflowTransition) => boolean;
export declare const getNextState: (from: WorkflowState, transition: WorkflowTransition) => WorkflowState | null;
export declare const applyTransition: (instance: WorkflowInstance, transition: WorkflowTransition, metadata: ApplyTransitionMetadata) => WorkflowInstance;
export declare const createInitialWorkflowTransition: (at: ApplyTransitionMetadata["at"]) => WorkflowTransitionRecord;
//# sourceMappingURL=foundation-workflow.machine.d.ts.map