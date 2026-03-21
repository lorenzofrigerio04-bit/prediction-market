import type { Branded } from "../common/types/branded.js";
export type Timestamp = Branded<string, "Timestamp">;
export type DateRange = Readonly<{
    start: Timestamp;
    end: Timestamp;
}>;
export type ResolutionWindow = Readonly<{
    openAt: Timestamp;
    closeAt: Timestamp;
}>;
export declare const createTimestamp: (value: string | Date) => Timestamp;
export declare const createDateRange: (start: string | Date | Timestamp, end: string | Date | Timestamp) => DateRange;
export declare const createResolutionWindow: (openAt: string | Date | Timestamp, closeAt: string | Date | Timestamp) => ResolutionWindow;
//# sourceMappingURL=timestamp.vo.d.ts.map