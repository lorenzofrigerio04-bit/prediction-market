import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { EventPriority } from "../../../enums/event-priority.enum.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import { SchedulingStatus } from "../../enums/scheduling-status.enum.js";
import {
  createBlockingIssue,
  type BlockingIssue,
} from "../../value-objects/blocking-issue.vo.js";
import type { DeliveryReadinessReportId } from "../../value-objects/delivery-readiness-report-id.vo.js";
import { createDeliveryReadinessReportId } from "../../value-objects/delivery-readiness-report-id.vo.js";
import type { PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { createPublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { createSchedulingCandidateId, type SchedulingCandidateId } from "../../value-objects/scheduling-candidate-id.vo.js";
import { createSchedulingNote, type SchedulingNote } from "../../value-objects/scheduling-note.vo.js";
import { createSchedulingWindow, type SchedulingWindow } from "./scheduling-window.entity.js";

export type SchedulingCandidate = Readonly<{
  id: SchedulingCandidateId;
  publication_package_id: PublicationPackageId;
  scheduling_window: SchedulingWindow;
  priority_level: EventPriority;
  scheduling_notes: readonly SchedulingNote[];
  scheduling_status: SchedulingStatus;
  readiness_status: ReadinessStatus;
  delivery_readiness_report_id: DeliveryReadinessReportId | null;
  blocking_issues_snapshot: readonly BlockingIssue[];
}>;

export type SchedulingCandidateInput = Readonly<{
  id: string;
  publication_package_id: string;
  scheduling_window: SchedulingWindow;
  priority_level: EventPriority;
  scheduling_notes: readonly string[];
  scheduling_status: SchedulingStatus;
  readiness_status: ReadinessStatus;
  delivery_readiness_report_id: string | null;
  blocking_issues_snapshot: readonly string[];
}>;

export const createSchedulingCandidate = (input: SchedulingCandidateInput): SchedulingCandidate => {
  if (!Object.values(EventPriority).includes(input.priority_level)) {
    throw new ValidationError("INVALID_SCHEDULING_CANDIDATE", "priority_level is invalid");
  }
  if (!Object.values(SchedulingStatus).includes(input.scheduling_status)) {
    throw new ValidationError("INVALID_SCHEDULING_CANDIDATE", "scheduling_status is invalid");
  }
  if (!Object.values(ReadinessStatus).includes(input.readiness_status)) {
    throw new ValidationError("INVALID_SCHEDULING_CANDIDATE", "readiness_status is invalid");
  }
  return deepFreeze({
    id: createSchedulingCandidateId(input.id),
    publication_package_id: createPublicationPackageId(input.publication_package_id),
    scheduling_window: createSchedulingWindow(input.scheduling_window),
    priority_level: input.priority_level,
    scheduling_notes: deepFreeze(input.scheduling_notes.map(createSchedulingNote)),
    scheduling_status: input.scheduling_status,
    readiness_status: input.readiness_status,
    delivery_readiness_report_id:
      input.delivery_readiness_report_id === null
        ? null
        : createDeliveryReadinessReportId(input.delivery_readiness_report_id),
    blocking_issues_snapshot: deepFreeze(input.blocking_issues_snapshot.map(createBlockingIssue)),
  });
};
