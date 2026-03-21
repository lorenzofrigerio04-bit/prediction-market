import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoveryJobDefinition } from "./discovery-job-definition.entity.js";
export type DiscoveryJobExecutionRequest = Readonly<{
    jobDefinition: DiscoveryJobDefinition;
    requestedAt: Timestamp;
}>;
export declare const createDiscoveryJobExecutionRequest: (input: DiscoveryJobExecutionRequest) => DiscoveryJobExecutionRequest;
//# sourceMappingURL=discovery-job-execution-request.entity.d.ts.map