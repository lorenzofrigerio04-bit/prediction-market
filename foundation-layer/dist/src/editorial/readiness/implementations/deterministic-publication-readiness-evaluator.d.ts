import { type PublicationReadyArtifact } from "../entities/publication-ready-artifact.entity.js";
import type { PublicationReadinessEvaluator, ReadinessEvaluationInput } from "../interfaces/publication-readiness-evaluator.js";
export declare class DeterministicPublicationReadinessEvaluator implements PublicationReadinessEvaluator {
    evaluate(input: ReadinessEvaluationInput): PublicationReadyArtifact;
}
//# sourceMappingURL=deterministic-publication-readiness-evaluator.d.ts.map