import { EventPriority } from "../../../enums/event-priority.enum.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import { SchedulingStatus } from "../../enums/scheduling-status.enum.js";
import { type BlockingIssue } from "../../value-objects/blocking-issue.vo.js";
import type { DeliveryReadinessReportId } from "../../value-objects/delivery-readiness-report-id.vo.js";
import type { PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { type SchedulingCandidateId } from "../../value-objects/scheduling-candidate-id.vo.js";
import { type SchedulingNote } from "../../value-objects/scheduling-note.vo.js";
import { type SchedulingWindow } from "./scheduling-window.entity.js";
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
export declare const createSchedulingCandidate: (input: SchedulingCandidateInput) => SchedulingCandidate;
//# sourceMappingURL=scheduling-candidate.entity.d.ts.map