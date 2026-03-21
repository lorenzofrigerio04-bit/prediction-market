import type { ReasonCode } from "../enums/reason-code.enum.js";
export type RequiredAction = Readonly<{
    code: ReasonCode;
    description: string;
    owner: string;
    is_mandatory: boolean;
}>;
export declare const createRequiredAction: (input: RequiredAction) => RequiredAction;
export declare const createRequiredActionCollection: (input: readonly RequiredAction[]) => readonly RequiredAction[];
//# sourceMappingURL=required-action.vo.d.ts.map