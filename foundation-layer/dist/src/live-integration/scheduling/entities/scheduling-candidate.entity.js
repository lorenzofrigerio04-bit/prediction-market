import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { EventPriority } from "../../../enums/event-priority.enum.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import { SchedulingStatus } from "../../enums/scheduling-status.enum.js";
import { createBlockingIssue, } from "../../value-objects/blocking-issue.vo.js";
import { createDeliveryReadinessReportId } from "../../value-objects/delivery-readiness-report-id.vo.js";
import { createPublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { createSchedulingCandidateId } from "../../value-objects/scheduling-candidate-id.vo.js";
import { createSchedulingNote } from "../../value-objects/scheduling-note.vo.js";
import { createSchedulingWindow } from "./scheduling-window.entity.js";
export const createSchedulingCandidate = (input) => {
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
        delivery_readiness_report_id: input.delivery_readiness_report_id === null
            ? null
            : createDeliveryReadinessReportId(input.delivery_readiness_report_id),
        blocking_issues_snapshot: deepFreeze(input.blocking_issues_snapshot.map(createBlockingIssue)),
    });
};
//# sourceMappingURL=scheduling-candidate.entity.js.map