import type { ReasonCode } from "../enums/reason-code.enum.js";
export type BlockingFlag = Readonly<{
    code: ReasonCode;
    message: string;
    path: string;
    is_resolved: boolean;
}>;
export declare const createBlockingFlag: (input: BlockingFlag) => BlockingFlag;
export declare const createBlockingFlagCollection: (input: readonly BlockingFlag[], fieldName: string) => readonly BlockingFlag[];
//# sourceMappingURL=blocking-flag.vo.d.ts.map