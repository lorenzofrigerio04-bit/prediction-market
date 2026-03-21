import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import { DiscoveryErrorCode } from "../enums/discovery-error-code.enum.js";
import type { DiscoveryValidationFailure } from "./discovery-validation-failure.entity.js";
export type DiscoveryErrorReport = Readonly<{
    runId: DiscoveryRunId;
    code: DiscoveryErrorCode;
    message: string;
    failures: readonly DiscoveryValidationFailure[];
    timestamp: Timestamp;
}>;
export declare const createDiscoveryErrorReport: (input: DiscoveryErrorReport) => DiscoveryErrorReport;
//# sourceMappingURL=discovery-error-report.entity.d.ts.map