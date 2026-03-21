import { type PipelineHealthSnapshot } from "../entities/pipeline-health-snapshot.entity.js";
import type { PipelineHealthEvaluator, PipelineHealthInput } from "../interfaces/pipeline-health-evaluator.js";
export declare class DeterministicPipelineHealthEvaluator implements PipelineHealthEvaluator {
    evaluate(input: PipelineHealthInput): PipelineHealthSnapshot;
}
//# sourceMappingURL=deterministic-pipeline-health-evaluator.d.ts.map