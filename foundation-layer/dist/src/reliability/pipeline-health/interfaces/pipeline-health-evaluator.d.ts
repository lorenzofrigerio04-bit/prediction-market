import type { PipelineHealthSnapshot } from "../entities/pipeline-health-snapshot.entity.js";
import type { ModuleHealthMetric } from "../../metrics/entities/module-health-metric.entity.js";
import type { TargetModule } from "../../enums/target-module.enum.js";
import type { RegressionStatus } from "../../enums/regression-status.enum.js";
export type PipelineHealthInput = Readonly<{
    covered_modules: readonly TargetModule[];
    module_metrics: readonly ModuleHealthMetric[];
    pass_rate: number;
    regression_status: RegressionStatus;
}>;
export interface PipelineHealthEvaluator {
    evaluate(input: PipelineHealthInput): PipelineHealthSnapshot;
}
//# sourceMappingURL=pipeline-health-evaluator.d.ts.map