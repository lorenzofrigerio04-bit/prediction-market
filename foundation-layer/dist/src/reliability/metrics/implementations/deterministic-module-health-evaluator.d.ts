import { type ModuleHealthMetric } from "../entities/module-health-metric.entity.js";
import type { ModuleHealthEvaluator, ModuleHealthInputMetric } from "../interfaces/module-health-evaluator.js";
import type { TargetModule } from "../../enums/target-module.enum.js";
export declare class DeterministicModuleHealthEvaluator implements ModuleHealthEvaluator {
    evaluate(moduleName: TargetModule, metrics: readonly ModuleHealthInputMetric[]): readonly ModuleHealthMetric[];
}
//# sourceMappingURL=deterministic-module-health-evaluator.d.ts.map