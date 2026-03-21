import { type DeliveryReadinessReport } from "../entities/delivery-readiness-report.entity.js";
import type { DeliveryReadinessEvaluator, EvaluateDeliveryReadinessInput } from "../interfaces/delivery-readiness-evaluator.js";
export declare class DeterministicDeliveryReadinessEvaluator implements DeliveryReadinessEvaluator {
    determineReadinessStatus(input: EvaluateDeliveryReadinessInput): DeliveryReadinessReport["readiness_status"];
    evaluate(input: EvaluateDeliveryReadinessInput): DeliveryReadinessReport;
}
//# sourceMappingURL=deterministic-delivery-readiness-evaluator.d.ts.map