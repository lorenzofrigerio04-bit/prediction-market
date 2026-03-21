import type { Timestamp } from "../../value-objects/timestamp.vo.js";
export type DiscoveryExecutionWindow = Readonly<{
    start: Timestamp;
    end: Timestamp;
}>;
export declare const createDiscoveryExecutionWindow: (input: DiscoveryExecutionWindow) => DiscoveryExecutionWindow;
//# sourceMappingURL=discovery-execution-window.vo.d.ts.map