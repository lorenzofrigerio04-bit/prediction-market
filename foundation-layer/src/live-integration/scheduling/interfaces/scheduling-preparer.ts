import type { EventPriority } from "../../../enums/event-priority.enum.js";
import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import type { DeliveryReadinessReport } from "../../readiness/entities/delivery-readiness-report.entity.js";
import type { PublicationPackage } from "../../packaging/entities/publication-package.entity.js";
import type { SchedulingCandidate } from "../entities/scheduling-candidate.entity.js";
import type { SchedulingWindow } from "../entities/scheduling-window.entity.js";

export type PrepareSchedulingCandidateInput = Readonly<{
  publication_package: PublicationPackage;
  scheduling_window: SchedulingWindow;
  priority_level: EventPriority;
  readiness_report: DeliveryReadinessReport;
  scheduling_notes: readonly string[];
}>;

export interface SchedulingPreparer {
  prepareSchedulingCandidate(input: PrepareSchedulingCandidateInput): SchedulingCandidate;
  evaluateSchedulingEligibility(input: SchedulingCandidate): ValidationReport;
}
