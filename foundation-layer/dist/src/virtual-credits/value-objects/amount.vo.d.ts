import type { Branded } from "../../common/types/branded.js";
export type Amount = Branded<number, "Amount">;
export declare const createAmount: (value: number, options?: Readonly<{
    allowZero?: boolean;
    allowNegative?: boolean;
}>) => Amount;
//# sourceMappingURL=amount.vo.d.ts.map