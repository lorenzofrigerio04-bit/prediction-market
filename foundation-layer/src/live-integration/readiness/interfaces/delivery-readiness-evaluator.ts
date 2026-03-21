import type { PublicationReadyArtifact } from "../../../editorial/readiness/entities/publication-ready-artifact.entity.js";
import type { DeliveryReadinessReport } from "../entities/delivery-readiness-report.entity.js";
import type { PublicationPackage } from "../../packaging/entities/publication-package.entity.js";

export type EvaluateDeliveryReadinessInput = Readonly<{
  publication_package: PublicationPackage;
  publication_ready_artifact: PublicationReadyArtifact;
  validated_at: string;
}>;

export interface DeliveryReadinessEvaluator {
  evaluate(input: EvaluateDeliveryReadinessInput): DeliveryReadinessReport;
  determineReadinessStatus(input: EvaluateDeliveryReadinessInput): DeliveryReadinessReport["readiness_status"];
}
