import type { TargetModule } from "../enums/target-module.enum.js";
export type BlockingReason = Readonly<{
    code: string;
    message: string;
    module_name: TargetModule;
    path: string;
}>;
export declare const createBlockingReason: (input: BlockingReason) => BlockingReason;
export declare const createBlockingReasonCollection: (input: readonly BlockingReason[]) => readonly BlockingReason[];
//# sourceMappingURL=blocking-reason.vo.d.ts.map