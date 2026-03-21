import type { ReasonCode } from "../enums/reason-code.enum.js";
export type WarningEntry = Readonly<{
    code: ReasonCode;
    message: string;
    path: string;
}>;
export declare const createWarningEntry: (input: WarningEntry) => WarningEntry;
export declare const createWarningCollection: (input: readonly WarningEntry[]) => readonly WarningEntry[];
//# sourceMappingURL=warning.vo.d.ts.map