import { type ControlledStateTransition } from "../entities/controlled-state-transition.entity.js";
import type { ControlledStateTransitionManager, ControlledTransitionContext } from "../interfaces/controlled-state-transition-manager.js";
export declare class DeterministicControlledStateTransitionManager implements ControlledStateTransitionManager {
    validateTransition(transition: ControlledStateTransition, context: ControlledTransitionContext): ControlledStateTransition;
}
//# sourceMappingURL=deterministic-controlled-state-transition-manager.d.ts.map