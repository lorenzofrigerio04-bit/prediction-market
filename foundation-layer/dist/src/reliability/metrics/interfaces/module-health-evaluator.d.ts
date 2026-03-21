import type { TargetModule } from "../../enums/target-module.enum.js";
import type { ModuleHealthMetric } from "../entities/module-health-metric.entity.js";
export type ModuleHealthInputMetric = Readonly<{
    metric_name: string;
    metric_value: number;
}>;
export interface ModuleHealthEvaluator {
    evaluate(moduleName: TargetModule, metrics: readonly ModuleHealthInputMetric[]): readonly ModuleHealthMetric[];
}
//# sourceMappingURL=module-health-evaluator.d.ts.map