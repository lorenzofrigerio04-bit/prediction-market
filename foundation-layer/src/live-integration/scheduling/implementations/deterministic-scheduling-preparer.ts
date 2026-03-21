import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import { SchedulingStatus } from "../../enums/scheduling-status.enum.js";
import { createSchedulingCandidate, type SchedulingCandidate } from "../entities/scheduling-candidate.entity.js";
import type { PrepareSchedulingCandidateInput, SchedulingPreparer } from "../interfaces/scheduling-preparer.js";
import { createSchedulingCandidateId } from "../../value-objects/scheduling-candidate-id.vo.js";
import { validateSchedulingCandidate } from "../validators/validate-scheduling-candidate.js";

const deriveSchedulingStatus = (status: ReadinessStatus): SchedulingStatus => {
  if (status === ReadinessStatus.READY || status === ReadinessStatus.WARNING) {
    return SchedulingStatus.READY;
  }
  return SchedulingStatus.BLOCKED;
};

export class DeterministicSchedulingPreparer implements SchedulingPreparer {
  prepareSchedulingCandidate(input: PrepareSchedulingCandidateInput): SchedulingCandidate {
    const token = createDeterministicToken(
      `${input.publication_package.id}|${input.scheduling_window.start_at}|${input.scheduling_window.end_at}|${input.readiness_report.id}`,
    );
    const readinessStatus = input.readiness_report.readiness_status;
    const schedulingStatus = deriveSchedulingStatus(readinessStatus);
    return createSchedulingCandidate({
      id: createSchedulingCandidateId(`scnd_${token}sch`),
      publication_package_id: input.publication_package.id,
      scheduling_window: input.scheduling_window,
      priority_level: input.priority_level,
      scheduling_notes: input.scheduling_notes,
      scheduling_status: schedulingStatus,
      readiness_status: readinessStatus,
      delivery_readiness_report_id: input.readiness_report.id,
      blocking_issues_snapshot: input.readiness_report.blocking_issues,
    });
  }

  evaluateSchedulingEligibility(input: SchedulingCandidate) {
    return validateSchedulingCandidate(input);
  }
}
