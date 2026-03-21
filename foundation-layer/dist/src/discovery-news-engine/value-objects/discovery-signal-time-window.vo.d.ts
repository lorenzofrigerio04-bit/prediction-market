import type { Timestamp } from "../../value-objects/timestamp.vo.js";
export type DiscoverySignalTimeWindow = Readonly<{
    start: Timestamp;
    end: Timestamp;
}>;
export declare const createDiscoverySignalTimeWindow: (input: DiscoverySignalTimeWindow) => DiscoverySignalTimeWindow;
//# sourceMappingURL=discovery-signal-time-window.vo.d.ts.map