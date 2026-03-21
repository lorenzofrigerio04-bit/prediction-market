export type WarningMessage = Readonly<{
    code: string;
    message: string;
    path: string;
}>;
export declare const createWarningMessage: (input: WarningMessage) => WarningMessage;
export declare const createWarningMessageCollection: (input: readonly WarningMessage[]) => readonly WarningMessage[];
//# sourceMappingURL=warning-message.vo.d.ts.map