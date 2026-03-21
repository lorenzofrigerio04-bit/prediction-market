import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
export type SchedulingWindow = Readonly<{
    start_at: Timestamp;
    end_at: Timestamp;
}>;
export type SchedulingWindowInput = Readonly<{
    start_at: string;
    end_at: string;
}>;
export declare const createSchedulingWindow: (input: SchedulingWindowInput) => SchedulingWindow;
//# sourceMappingURL=scheduling-window.entity.d.ts.map